# Version / Reality Check Review — ARCHITECTURE-SPINE.md (remindeer, 2026-08-01)

Scope: verify every version claim and named technology in the Stack table (and the invariants that lean on them) against the actual project install and current web reality, not training-data assumptions.

## 1. Next.js / React / TypeScript / Tailwind — MATCH, verified against installed package.json

`C:\Users\gusta\Documents\github\remindeer\package.json`:
- `next`: `16.2.12` — matches spine exactly.
- `react` / `react-dom`: `19.2.4` — matches spine exactly.
- `typescript`: `^5` (devDependency) — matches spine's `^5`.
- `tailwindcss`: `^4` (devDependency, via `@tailwindcss/postcss`) — matches spine's `^4`.

These four rows are not asserted from training data — they are copied from the real, installed project. No discrepancy.

## 2. @supabase/supabase-js ^2.111.0 — CURRENT, verified via web search

Web search against npm confirms `@supabase/supabase-js` latest is `2.111.0`, published within days of the architecture's `2026-08-01` date. The pin is real and current, not hallucinated, and not superseded by a newer major (still v2 line; no v3 announced). **Not installed in package.json yet** — this is a planned dependency, correctly flagged as such by the spine (it's in the Stack table, not in the repo's package.json, since no Supabase code exists yet). Low risk.

## 3. zod ^4.4.3 — CURRENT, but architecturally consequential and under-specified — MEDIUM finding

Web search confirms `zod@4.4.3` is a real, current, recently-published version, and v4 is the stable major line (first stable v4 release mid-2025; no v5 yet). So the pin itself is sane and not hallucinated.

**However**, the spine does not surface that Zod v4 is a breaking rewrite vs. v3 (different error-customization API — `error` param replaces `message`/`invalid_type_error`/`required_error`; changed generics). Since AD-5 commits to "validates input server-side" via zod in `lib/actions/submitQuizCompletion.ts` but gives no code, this isn't a bug yet — but any future story/dev-agent that free-associates zod v3 patterns (e.g. `z.string({ required_error: ... })`) from training data will silently write invalid v4 code. Recommend the spine or a companion note explicitly pin "v4 API, not v3" so implementers don't default to older patterns.

## 4. server-only ^0.0.1 — CURRENT (expected), verified via web search

Web search confirms `server-only` on npm is still at `0.0.1`, last published ~4 years ago — this is normal for this package (a tiny build-time guard shim; it has never needed a version bump). Not a stale/abandoned-package red flag, just a package that reached feature-complete at 0.0.1. The mechanism it enforces (build error when a Client Component imports a module that imports `server-only`) is real and current — confirmed against the bundled Next.js docs' App Router security guidance (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md`, "Security" section), which points to the same client/server boundary pattern this package implements.

## 5. Next.js App Router mechanisms — VERIFIED against the actual installed docs

Read `node_modules\next\dist\docs\01-app\02-guides\server-actions.md` (bundled with the exact installed Next.js 16.2.12). Confirms, for this exact install:
- Server Actions (`'use server'`) are a real, current, first-class App Router mutation mechanism — not deprecated or renamed. AD-5's design (single Server Action as the FR-11 write boundary, validates server-side, no client Supabase key) matches the documented security model almost verbatim (the docs explicitly warn: treat every action as an untrusted POST endpoint, validate inputs, don't leak raw records back to the client).
- Route Handlers still exist as a distinct, still-supported mechanism (the docs reference them as the alternative for non-mutation/parallel work) — so AD-5's choice of Server Actions over Route Handlers is a real, current either/or decision, not a false dichotomy.
- Server Components as the default with Client Component islands (AD-8) is consistent with the docs' framing throughout (Server Components are the implicit default; Client Components are opt-in via `'use client'`).
- One thing not covered by the fetched doc but worth noting for implementers: Next.js rotates Server Action IDs on redeploy (at most every 14 days per the docs), which can produce a "Failed to find Server Action" error for a user mid-submission on the final-screen form across a deploy. Not a spine defect — just an operational edge case AD-5 doesn't currently mention and might want to (a retry-on-failure UX for the completion write).

## 6. Supabase service-role vs anon key model — VERIFIED but PARTIALLY OUT OF DATE — HIGH finding

Web search confirms the core mental model the spine relies on is still correct today: the service-role key bypasses RLS entirely (Postgres `BYPASSRLS`) and must never reach the browser; the anon key is RLS-gated and safe for client code. AD-5 and the Consistency Conventions row ("Service-role key read from `SUPABASE_SERVICE_ROLE_KEY` server env only; no Supabase env var carries the `NEXT_PUBLIC_` prefix") are directionally correct.

**But**: Supabase is actively retiring the legacy JWT-based `anon` / `service_role` keys in favor of new opaque `sb_publishable_...` / `sb_secret_...` keys (introduced mid-2025). Per Supabase's own docs/discussions found via search: **new Supabase projects created since November 2025 no longer have legacy `anon`/`service_role` keys available at all** — only the new publishable/secret pair — and legacy keys across the board are slated for full deprecation by end of 2026. Since this project's Supabase instance is explicitly not yet provisioned (OQ-5, "Supabase project provisioning... not activated yet"), whoever provisions it in the coming weeks will likely get `sb_publishable_...`/`sb_secret_...` keys, not a `service_role` JWT.

Functionally the architecture still holds — the new `sb_secret_...` key plays the exact same "server-only, bypasses RLS, do the insert with elevated privilege" role, and `@supabase/supabase-js` accepts either key format as the same client-constructor argument — but the spine's literal naming (`SUPABASE_SERVICE_ROLE_KEY`, "service-role key") may not match what actually gets issued when OQ-5 is executed. Recommend a note in AD-5/AD-11 or OQ-5: "if the provisioned project issues new-format keys, use `sb_secret_...` under an equivalently-named server-only env var; the server-only/never-in-client-bundle rule is unchanged."

## 7. Supabase EU-Frankfurt region — VERIFIED, still current

Web search confirms Frankfurt (`eu-central-1`) remains an available, standard Supabase hosted region in 2026, with the usual EU/GDPR data-residency framing (DPA + SOC 2 Type 2) the spine's NFR-3 binding implies. No change needed.

## Summary of Findings

| # | Severity | Finding |
| --- | --- | --- |
| 1 | Info | Next.js/React/TS/Tailwind versions in Stack table match `package.json` exactly — correctly reality-checked, not asserted. |
| 2 | Low | `@supabase/supabase-js ^2.111.0` and `zod ^4.4.3` are real, current npm versions (verified), not yet installed since no Supabase/zod code exists yet — expected for a not-yet-built dependency. |
| 3 | Medium | Zod v4's breaking API changes vs. v3 (error-customization params, generics) aren't called out anywhere the spine or its implementers would see them before writing `submitQuizCompletion.ts`; risk of a future dev agent free-associating v3-style zod code from training data. |
| 4 | Info | `server-only@0.0.1` is legitimately stable at that version (not abandoned); mechanism confirmed real and current against the bundled Next.js 16.2.12 docs. |
| 5 | Info | Server Actions vs. Route Handlers, and Server-Components-by-default, are both confirmed current, non-deprecated App Router mechanisms per the docs bundled with the actual installed Next.js version. |
| 6 | High | Supabase is retiring legacy `anon`/`service_role` JWT keys in favor of `sb_publishable_...`/`sb_secret_...`; new projects since Nov 2025 no longer issue legacy keys at all. AD-5's "service-role key" / `SUPABASE_SERVICE_ROLE_KEY` naming may not match what OQ-5's not-yet-provisioned project actually receives, though the underlying server-only/RLS-bypass architecture is unaffected. |
| 7 | Info | Supabase EU-Frankfurt region confirmed still live and current for NFR-3 data residency. |

## Overall Verdict

The spine's hard version pins (Next.js, React, TS, Tailwind) are correctly reality-checked against the actual repo rather than invented. The named npm packages (`@supabase/supabase-js`, `zod`, `server-only`) are real, current, non-hallucinated versions. The App Router mechanisms it commits to (Server Actions, Server Components default, `server-only` boundary) are verified live and current against the exact installed Next.js docs. The one substantive gap is Supabase's key-model transition (legacy `service_role`/`anon` → `sb_secret`/`sb_publishable`), which the spine's terminology doesn't account for and which will concretely affect how OQ-5 (project provisioning) and AD-5's env var naming play out — this should be called out before implementation starts, not discovered when someone provisions the project and finds no `service_role` key waiting for them.
