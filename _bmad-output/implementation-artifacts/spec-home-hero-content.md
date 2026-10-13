---
title: 'Home hero editable from the backoffice'
type: 'feature'
created: '2026-10-13'
status: 'done'
baseline_commit: '7537d8b'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/specs/spec-home-hero-content/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-home-hero-content/page-content-contract.md'
  - '{project-root}/_bmad-output/specs/spec-home-hero-content/stack.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The home hero's title, subtitle, CTA label, CTA note, stats and image are hard-coded in `components/landing/hero.tsx`, so an admin cannot change them from the backoffice "Contenuti pagine" section.

**Approach:** The hero reads its content on the server through one `lib/data/` function that calls the `get_page_content` RPC, validates the result field by field and falls back to today's copy. The read is cached under tag `page-content:home` (about one hour), `/` stays statically rendered, and a secret-protected `POST /api/revalidate` lets a Supabase Database Webhook expire the tag. Canonical contract: `SPEC-home-hero-content` (CAP-1..8) and its companions.

## Boundaries & Constraints

**Always:**
- Page content is fetched on the server only; `/` is reported as static by `next build`.
- No component calls Supabase; the RPC result is untrusted and validated in `lib/data/`.
- A failed read (RPC error, network, exception) is never stored in the cache; `null` or invalid fields are valid answers, cached with defaults applied.
- Every failure is logged on the server; `/` never fails to render and never shows an empty hero.
- Hero layout, classes, `CategoryTag` text and CTA target `/quiz` stay exactly as they are.
- Image URL = `${SUPABASE_URL}/storage/v1/object/public/page-images/${path}`; the storage host is allowed in `next/image` config.
- Revalidation endpoint: header `x-revalidate-secret`, constant-time compare with `REVALIDATE_SECRET`, fail closed when unset, immediate expiry of the tag.

**Ask First:**
- The contract turns out insufficient (stop and report, no workaround).
- Next.js 16 cannot keep the last good content on a failed refresh without enabling `cacheComponents` or making `/` dynamic.
- Any change outside the Code Map files.

**Never:**
- Client-side fetching of page content, or a hero loading state.
- Database objects, migrations, webhook creation, hosting changes, `output: "export"`.
- Signed URLs or cache-busting for page images; reusing the mascot alt on a remote image.
- Hand-editing `lib/supabase/database.types.ts`; pages other than home; backoffice work.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Full content | RPC returns a valid object | Hero renders its title, subtitle, CTA label/note, stats, remote image | N/A |
| No row | RPC returns `null` or a non-object | Defaults + mascot; result cached | logged |
| Partial content | Some fields missing, non-string or whitespace-only | Each bad field takes its own default, valid fields kept | N/A |
| Stats shapes | `stats` missing or not an array / `[]` / 6 entries / entry without `value` or `label` | 3 defaults / no stats row at all / first 4 / entry dropped | N/A |
| Image shapes | `hero_image` `null` or without `path` / with `path`, empty `alt` | Mascot 1213×1217 with its alt / remote image with `alt=""` | N/A |
| Read fails, nothing cached | RPC error (e.g. `PGRST202`), throw | Defaults; failure not cached | logged |
| Read fails, content cached | Refresh fails after a good read | Same admin content stays on `/`; next good refresh updates it | logged |
| Webhook unauthorized | Header missing or wrong, or `REVALIDATE_SECRET` unset | 401, nothing revalidated | N/A |
| Webhook bad body | Authorized; unparseable JSON or no slug in `record` / `old_record` | 400 | N/A |
| Webhook ok | Authorized; `record.slug`, else `old_record.slug` | 200; `page-content:{slug}` expired | N/A |

</frozen-after-approval>

## Code Map

- `lib/data/pageContent.ts` -- NEW: `getHomeContent()`, parser, defaults, cached RPC read
- `lib/data/types.ts` -- add `HomeContent` shape (client-safe)
- `lib/data/questions.ts` -- model for the data funnel (`server-only`, `getSupabaseClient`)
- `lib/supabase/database.types.ts` -- regenerated with the CLI: the RPC went live on 2026-10-13, so no hand-typed call
- `components/landing/hero.tsx` -- takes `content` prop; renders stats row and image conditionally
- `app/page.tsx` -- becomes async, calls `getHomeContent()`, exports `revalidate = 3600`
- `app/api/revalidate/route.ts` -- NEW: webhook endpoint
- `next.config.ts` -- `images.remotePatterns` derived from `SUPABASE_URL`
- `.env.example`, `.gitignore` -- NEW env doc; `.env*` is ignored, so add `!.env.example`
- `__tests__/data/pageContent.test.ts`, `__tests__/api/revalidate.test.ts` -- NEW

## Tasks & Acceptance

**Execution:**
- [x] `lib/data/types.ts` -- add `HomeContent` (`title`, `subtitle`, `cta`, `stats`, `image: { src, alt, remote }`) -- single shape shared by data layer and hero
- [x] `lib/data/pageContent.ts` -- export `DEFAULT_HOME_CONTENT`, pure `parseHomeContent(raw)`, and `getHomeContent()` wrapping a throwing RPC read in `unstable_cache(…, ["page-content", "home"], { tags: ["page-content:home"], revalidate: 3600 })` -- fallback rules at the boundary; errors thrown inside the cached read so they are never stored
- [x] `components/landing/hero.tsx` -- replace literals and `TRUST_STATS` with the `content` prop; omit the stats row when empty; remote image `fill` + `object-contain` inside the existing square box, mascot branch unchanged; keep `loading="eager"` and `fetchPriority="high"` -- CAP-1/3/4
- [x] `app/page.tsx` -- fetch content, pass to `<Hero />`, `export const revalidate = 3600` -- CAP-5
- [x] `next.config.ts` -- allow `https://<supabase host>/storage/v1/object/public/page-images/**`; no pattern when `SUPABASE_URL` is unset -- CAP-4
- [x] `app/api/revalidate/route.ts` -- `POST`: auth, slug extraction, `revalidateTag(tag, { expire: 0 })` -- CAP-6
- [x] `.env.example`, `.gitignore` -- variable names without values + webhook steps (URL, header, table, events) as comments -- CAP-7
- [x] `__tests__/data/pageContent.test.ts`, `__tests__/api/revalidate.test.ts` -- cover every matrix row reachable in Vitest, including error-versus-`null` -- regression net
- [x] Production-build check -- `next build` + `next start` against a stubbed read: confirm `/` is static and observe what a failed refresh does after time-based staleness and after tag expiry; adjust `getHomeContent()` until the "content cached" row holds; record findings in Design Notes -- CAP-8 must be verified, not assumed

**Acceptance Criteria:**
- Given the RPC returns content, when `/` is built, then view-source contains title, subtitle, CTA and stats text and the browser issues no page-content request.
- Given a production build, when `next build` finishes, then `/` is listed as static with a 1h revalidation.
- Given a remote image of unknown size, when it loads, then the image box does not change size.
- Given the RPC is not deployed, when `/` renders, then it is identical to today's hero.

## Design Notes

Verified on a production build (`next build` + `next start`, Next 16.2.12) against a fake PostgREST whose answers were switched between runs.

What Next does: `unstable_cache` returns a *stale* entry when its recompute throws, but an *expired* entry is gone, so the throw propagates. A page whose tag is expired is rendered again while the visitor waits; if that render throws the answer is a **500**, not the previous page. The first candidate (rethrow on a running server so ISR keeps the old page) therefore failed and was dropped.

What was built: two tags per slug.
- `page-content:{slug}` sits on the page (through a no-op cached function) and is expired at once by the webhook: the first visitor after an edit gets a fresh render.
- `page-content-data:{slug}` sits on the cached RPC result and is only marked stale (`"max"`): the render re-reads it, and if the read fails the last good result is still there.

`getHomeContent()` catches a failed read only when nothing is cached, and returns the defaults. Interpretation of the frozen wording "cached under tag `page-content:home`": that tag is the one the webhook expires and the response reports; the data lives under its sibling.

Observed: edit + webhook → new content on the first request; source down + webhook → same admin content, HTTP 200; row deleted → defaults; source down at build → build succeeds with defaults; hourly refresh (tested at 5s) with source down → content kept, picked up again when the source returns. A render that hit a failed read makes its page expire after 60 seconds instead of an hour (a second no-op cached function with `revalidate: 60`), so an edit saved during an outage shows up about a minute after the source recovers; the page then returns to the hourly window. Verified with the retry temporarily at 5s.

Added in review: a webhook for a renamed slug revalidates both the new and the old slug (the contract names only the fallback); the response lists the revalidated tags.

Known limits, accepted: a webhook landing while a render is in flight can be missed until the next refresh; a remote image whose object is missing or unsupported shows an empty box (no existence check, no client fallback).

Not verifiable locally: that Vercel's data cache also hands back stale entries. If it evicted them, a failed read would fall to the defaults.

## Verification

**Commands:**
- `npm run lint` -- expected: no errors
- `npx tsc --noEmit` -- expected: no errors
- `npm test` -- expected: all suites pass
- `npm run build` -- expected: `/` marked static (○) with `1h` revalidate; `/api/revalidate` dynamic (ƒ)

**Manual checks (if no CLI):**
- `next start`: `curl -X POST /api/revalidate` without header → 401; with header and `{"record":{"slug":"home"}}` → 200.

## Suggested Review Order

**Cached read and last good content**

- Entry point: read, fallback to defaults, one-minute retry after a failed read
  [`pageContent.ts:84`](../../lib/data/pageContent.ts#L84)

- Two tags per slug: the page expires at once, the data only goes stale
  [`pageContent.ts:16`](../../lib/data/pageContent.ts#L16)

- The webhook's effect in one place: stale data first, then expired page
  [`pageContent.ts:33`](../../lib/data/pageContent.ts#L33)

- No-op cached functions that carry the page tag and the short retry
  [`pageContent.ts:59`](../../lib/data/pageContent.ts#L59)

- Page stays static; hourly literal as safety net for a missed webhook
  [`page.tsx:11`](../../app/page.tsx#L11)

**Untrusted content to complete content**

- Per-field fallback: only what is missing or empty takes its default
  [`pageContent.ts:134`](../../lib/data/pageContent.ts#L134)

- Explicit empty list is valid; invalid entries dropped before the cap of four
  [`pageContent.ts:151`](../../lib/data/pageContent.ts#L151)

- Remote image never inherits the mascot alt; public URL, no path escape
  [`pageContent.ts:168`](../../lib/data/pageContent.ts#L168)

- Defaults are today's hero, verbatim
  [`pageContent.ts:39`](../../lib/data/pageContent.ts#L39)

**Revalidation endpoint**

- Auth before body; 401, 400, then revalidation of every slug involved
  [`route.ts:13`](../../app/api/revalidate/route.ts#L13)

- Fails closed without a secret; both sides hashed for a constant-time compare
  [`route.ts:28`](../../app/api/revalidate/route.ts#L28)

- Slug from `record`, else `old_record`; both when renamed
  [`route.ts:43`](../../app/api/revalidate/route.ts#L43)

**Hero rendering**

- Content arrives as a prop; tag and CTA target stay fixed
  [`hero.tsx:16`](../../components/landing/hero.tsx#L16)

- No stats, no row: the container itself is omitted
  [`hero.tsx:38`](../../components/landing/hero.tsx#L38)

- Remote image fills a square box, so unknown dimensions cannot shift layout
  [`hero.tsx:54`](../../components/landing/hero.tsx#L54)

**Config, types, docs, tests**

- Image host derived from the server-only Supabase URL at build time
  [`next.config.ts:10`](../../next.config.ts#L10)

- Complete-content shape shared by data layer and hero
  [`types.ts:41`](../../lib/data/types.ts#L41)

- Regenerated with the CLI now that the RPC is live
  [`database.types.ts:419`](../../lib/supabase/database.types.ts#L419)

- Variable names and the manual webhook setup for the operator
  [`.env.example:14`](../../.env.example#L14)

- Fallback rules, error versus null, tag profiles
  [`pageContent.test.ts:51`](../../__tests__/data/pageContent.test.ts#L51)

- Auth, slug extraction, rename
  [`revalidate.test.ts:37`](../../__tests__/api/revalidate.test.ts#L37)

- Stats row, mascot and remote image branches
  [`hero.test.tsx:23`](../../__tests__/landing/hero.test.tsx#L23)
