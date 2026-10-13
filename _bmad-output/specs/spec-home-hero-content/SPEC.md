---
id: SPEC-home-hero-content
companions:
  - page-content-contract.md
  - stack.md
  - ../../project-context.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Home Hero Editable from the Backoffice

## Why

**An opportunity to capture, under one hard requirement.** The backoffice (`remindeer-backoffice`, separate repo, same Supabase project) is gaining a "Contenuti pagine" section where an admin edits the content of individual site pages; only the home page exists for now. Today the hero's headline, subtitle, CTA label, CTA note, stats and image are hard-coded in `components/landing/hero.tsx`, and `app/page.tsx` fetches nothing, so `/` is static. This spec covers the front-end side only: the hero reads its content from the backoffice. The requirement that drives every design choice: **the content is never fetched from the browser** — a client fetch shows an empty hero while in flight and hides the content from search engines. The page is served as complete HTML and stays as fast as it is now: fetched on the server, cached so `/` stays statically rendered, regenerated when the content changes.

## Capabilities

- **CAP-1** — Hero content from the backoffice
  - **intent:** The home hero shows the title, subtitle, CTA label, CTA note, stats and hero image authored in the backoffice.
  - **success:** With the RPC returning content, `/` renders those values; view-source of `/` contains the title, subtitle, CTA and stats text; no browser request fetches page content.

- **CAP-2** — Default content fallback
  - **intent:** The hero always renders complete content, whatever the content source does.
  - **success:** On `null` or an unexpected shape the hero renders the current copy and mascot image unchanged; a single missing or empty field falls back to its own default while valid fields are kept (rules in `page-content-contract.md`); on a failed read with no content ever cached, the hero renders the defaults; each failure is logged on the server; `/` never fails to render and never renders an empty hero.

- **CAP-8** — Last good content survives a failed refresh
  - **intent:** A transient failure of the content source does not revert the home page to the hard-coded defaults.
  - **success:** With admin content already cached, a refresh whose read fails leaves `/` showing that same admin content, and a later successful refresh picks up the current content.

- **CAP-3** — Variable stats row
  - **intent:** The hero shows the 0 to 4 stats the admin defined.
  - **success:** N valid stats render N items in the existing markup; zero stats render no stats row at all — not an empty container.

- **CAP-4** — Editable hero image as LCP
  - **intent:** The hero shows the admin-chosen image, or the mascot when none is chosen, without layout shift.
  - **success:** A remote image loads from the public `page-images` bucket with eager loading and high fetch priority; `hero_image: null` renders the static mascot at 1213×1217; the image box keeps a stable size before a remote image of unknown dimensions has loaded.

- **CAP-5** — Static home with cached content
  - **intent:** The home page stays statically rendered while its content comes from the database.
  - **success:** The production build output reports `/` as static, not rendered per request; cached content refreshes by itself within about one hour even if no webhook ever arrives.

- **CAP-6** — On-demand revalidation
  - **intent:** A content change saved in the backoffice reaches the public home page without a redeploy.
  - **success:** `POST /api/revalidate` returns 401 without the correct secret; with it, the cache tag of the slug in the webhook body is revalidated and the next render of `/` shows the new content.

- **CAP-7** — Operator documentation
  - **intent:** A human can finish the setup this repo must not perform.
  - **success:** `.env.example` lists every environment variable by name, `REVALIDATE_SECRET` included, with no values, and states the exact webhook setup — URL, header name, table, events.

## Constraints

- No client-side fetching of page content and no loading state for the hero.
- Hero layout, classes, `CategoryTag` text and the CTA target (`/quiz`) are not editable and stay exactly as they are. Quiz flow, other landing sections and visual design are untouched.
- Data funnel: one server-only function in `lib/data/` returns the home content; no component calls Supabase directly (lint-enforced, as for `lib/data/questions.ts`).
- The RPC result is untrusted input, validated at the `lib/data/` boundary. Read contract: `supabase.rpc("get_page_content", { p_slug: "home" })` with the publishable key, returning one object or `null`.
- Hero image URL is `${SUPABASE_URL}/storage/v1/object/public/page-images/${path}`. No signed URLs — they expire after one hour and cannot live inside a cached page. The Supabase storage host is allowed in the `next/image` configuration.
- The content fetch is cached under a per-slug tag (`page-content:home`) with a time-based revalidation of about one hour as a safety net for a missed webhook.
- The revalidation endpoint reads a shared secret from a request header and compares it to env `REVALIDATE_SECRET`; it reads the slug from `record.slug`, falling back to `old_record.slug`. The trigger is a Supabase Database Webhook on `page_contents`, because the backoffice is a browser-only SPA and cannot hold a secret.
- This repo creates or alters no database object; the schema belongs to `remindeer-backoffice`. If the contract is insufficient: stop and report, no workaround.
- The implementer does not create the Supabase webhook and does not change hosting settings; the exact steps are written down for a human.
- Hosting is Vercel (confirmed 2026-10-13): a server runtime is available and on-demand revalidation is supported. The site must never be switched to a pure static export, which would break CAP-5 and CAP-6.
- Before coding, read `AGENTS.md`/`CLAUDE.md` and the installed Next.js docs on caching and revalidation; the APIs changed between majors (findings in `stack.md`).
- Types: regenerate `lib/supabase/database.types.ts` if the RPC is live; otherwise type the result by hand and say so.
- The backoffice generates a new storage path on every upload and never overwrites an object (confirmed 2026-10-13), so a changed image always changes `hero_image.path`. This repo adds no cache-busting to image URLs.
- A remote hero image with an empty or missing `alt` renders with an empty alt (decorative). The mascot alt is never reused for another picture — the one exception to "empty field → its default".
- A failed read (RPC error, network error, exception) is never stored in the cache; a `null` result or an invalid field is a valid answer and is cached with defaults applied. Rules out a single catch-all that returns defaults from inside the cached read.
- How Next.js 16 treats a failed refresh is verified on a real production build, not assumed.
- Tests in `__tests__/` (existing Vitest setup) cover the fallback logic — error, `null`, malformed JSON, missing fields, zero stats — the error-versus-`null` distinction, and the route handler's auth check. Lint, typecheck and tests pass.
- The implementation report states: what changed; whether the RPC was live or the contract was built against; how the site is hosted and whether that supports on-demand revalidation; the manual steps left for a human (env var, webhook); every contract interpretation made.

## Non-goals

- No backoffice work: table, migration, RPC and admin form are built in the other repo.
- No page other than home.
- No editing of `CategoryTag`, CTA target, layout or any other landing section.
- No signed URLs for page images.
- No webhook creation or hosting change by the implementer.
- No revalidation call from the admin UI.

## Success signal

An admin saves new hero content; the database webhook calls `POST /api/revalidate` with the secret; view-source of `/` then shows the new title, subtitle, CTA and stats with no client fetch, and the production build still reports `/` as static. With the RPC unavailable, the page is identical to today's.

## Assumptions

- The RPC is not live (verified 2026-10-13, `PGRST202`); the result is typed by hand until the backoffice migration lands.
- The default content is the hero in the uncommitted working tree, mascot image included (`spec-remindeer` CAP-1 aligned 2026-10-13).
- A field is "empty" when missing, not a string, or whitespace-only. `updated_at` is neither rendered nor used.
- `stats` missing or not an array → the three default stats; an explicit `[]` is valid → no row. An entry lacking a non-empty `value` and `label` is dropped; entries beyond the fourth are ignored.
- `hero_image` that is `null` or has no usable `path` → the static mascot with its current alt.
- A remote image renders inside a fixed square box (the mascot is 1213×1217), contained without cropping; that is what keeps the layout stable.
- The secret header is `x-revalidate-secret`. With `REVALIDATE_SECRET` unset every request gets 401 (fail closed); the comparison is constant-time.
- The webhook fires on INSERT, UPDATE and DELETE of `public.page_contents`. A body with no usable slug gets 400; any slug has its tag revalidated, known page or not.
- Revalidation expires the tag immediately, so the first visitor after an edit gets fresh content rather than one stale response.

## Open Questions

- OQ-3 (backoffice request): make the image description mandatory in the admin form, so a remote hero image never ships with an empty alt. Not buildable in this repo.
