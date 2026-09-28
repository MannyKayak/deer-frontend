---
baseline_commit: 0a49ef9dfd007bcae962695d9b716fe7bb97341e
change_trigger: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md
---

# Story 1.5: Landing Email Signup Section

Status: in-progress

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> **AC #2 amended:** landing and post-quiz signups now share one mailing list (`email_signups`) — distinct forms and analytics events (`email_signup_landing` / `email_signup_quiz`), same table. Tasks 1-2 superseded:
> - The backoffice owns the schema (ADR-004); `supabase/migrations/0002`/`0003` are history only and are never pushed from here. Migration 0003 was never applied — deployed `email_signups` has only `id, email, created_at`.
> - `lib/data/emailSignup.ts` now inserts `{ email }` as anon (publishable key); secret key removed from the landing.
> - Action renamed `submitEmailSignup` (shared with Story 3.2); `lib/consent.ts` removed (no column to store it).
>
> **Blocked on backoffice (spec OQ-11):** `source` column, `consent_given_at` + `consent_text_version`, unique lowercase email, anon insert-only RLS policy. Until then: no consent proof stored, duplicates possible, inserts fail if the policy is missing. Signup insert not exercised against live DB (would write to the shared project).

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor who isn't ready to take the quiz,
I want to leave my email directly from the landing page,
so that I can stay informed about the launch without having to complete the quiz first.

## Acceptance Criteria

1. **Given** the landing page (hero, comparison section) is in place **When** a visitor scrolls to the section between the comparison section and the footer **Then** an email signup section renders with an email field (optional, format-validated only) and a separate consent checkbox with GDPR consent microcopy (placeholder copy acceptable pending OQ-3, same standard as Story 3.2).
2. **And** submitting requires a valid email format and a checked consent box — this is a dedicated, distinct submission path from the results-screen email capture (Story 3.2); the two never merge or share one record.
3. **And** a distinct analytics event `email_signup_landing` fires through `lib/analytics/track.ts` on successful submission, added to the fixed event list in `lib/analytics/events.ts`.
4. **And** the section is reachable and usable by a visitor who never starts or completes the quiz.
5. **And** the field and checkbox are keyboard-reachable and operable with a visible custom focus state, consistent with UX-DR13.
6. **And** the section renders correctly at both the 390px mobile and 1280px desktop reference breakpoints.

## Tasks / Subtasks

- [x] Task 1: Provision a new Supabase table for landing signups (AC: #2) — **read Dev Note: new table needed, this is not optional plumbing**
  - [x] Create `email_signups(id uuid pk default gen_random_uuid(), email text not null, created_at timestamptz not null default now())`, RLS enabled with **zero policies** — mirrors `quiz_completions`' pattern exactly (secret key bypasses RLS by design, publishable/anon key gets nothing)
  - [x] Apply against the same live Supabase project used by `quiz_completions` (AD-11: single project, no dev/prod split) — do not provision a second project
- [x] Task 2: `lib/data/emailSignup.ts` (AC: #2) — `insertEmailSignup({ email, createdAt }): Promise<void>`, following the exact pattern in `lib/data/quiz.ts` (`import "server-only"`, `getSupabaseClient()`, snake_case mapping only inside this file). This is required by the repo's own ADR-003 lint rule (`lib/data/README.md`) — no `supabase.from(...)` call is permitted outside `lib/data/`.
- [x] Task 3: `lib/actions/submitLandingEmailSignup.ts` (AC: #2) — new Server Action, modeled on `lib/actions/submitQuizCompletion.ts` but simpler:
  - [x] `'use server'` + `import "server-only"`
  - [x] Zod schema: `email: z.string().email()`, `consent` read from `formData.get("consent") === "true"` (same pattern as the existing action)
  - [x] If consent is false, return `{ ok: false, error: "..." }` without inserting (unlike Story 3.2's independence rule — there is no separate feedback/completion event here to keep independent, this form's *only* purpose is the email, so no consent means no submission at all)
  - [x] `createdAt = new Date().toISOString()` stamped server-side
  - [x] Returns `{ ok: true } | { ok: false, error: string }`, never throws
- [x] Task 4: `components/landing/email-signup.tsx` (AC: #1, #4, #5, #6)
  - [x] Server Component wrapper section (matches `ComparisonSection`'s pattern — heading + copy), with a small `'use client'` island inside for the form itself (reuse `components/ui/email-capture.tsx` for the email+consent UI — it's already a generic, prop-driven controlled component, no changes needed to it)
  - [x] `useActionState(submitLandingEmailSignup, null)` drives the form, same wiring pattern as `ResultsScreen`'s existing form (Story 3.3)
  - [x] On `{ok:true}`, fire `track("email_signup_landing")` via `useEffect` watching the action state (same pattern as `quiz_completed` in `results-screen.tsx`)
  - [x] Explicit submit button (`ButtonPrimary`, compact variant)
- [x] Task 5: Add `"email_signup_landing"` to `ANALYTICS_EVENTS` in `lib/analytics/events.ts` (AC: #3)
- [x] Task 6: Mount `<EmailSignupSection />` in `app/page.tsx` between `<ComparisonSection />` and `<Footer />` (AC: #1) — coordinate with Story 2.1-REV if implementing both in the same pass, since 2.1-REV also edits `app/page.tsx`'s structure
- [x] Task 7: Verify (AC: #1–#6) — build, manual keyboard-nav check, manual submit against the live Supabase table (same style of standalone smoke test Story 3.3 used, not committed)

### Review Findings

- [x] [Review][Patch] Deduplicate signups — migration `0003`: unique index on `lower(email)`; lowercase the email in the action; `upsert` with `ignoreDuplicates` so a resubmit still returns ok [supabase/migrations/0002_email_signups.sql:3]
- [x] [Review][Patch] Record consent per row (GDPR art. 7(1)) — migration `0003`: add `consent_given_at timestamptz not null` and `consent_text_version text not null`; the action stamps both; the version is a constant next to the consent copy [lib/data/emailSignup.ts:16]
- [x] [Review][Patch] Email length unbounded — add `.max(254)` to the Zod schema [lib/actions/submitLandingEmailSignup.ts:8]
- [x] [Review][Patch] Insert failure swallowed silently — log the error server-side in the `catch` [lib/actions/submitLandingEmailSignup.ts:43]
- [x] [Review][Patch] `ButtonPrimary` has no `disabled:` styling — the pending "Invio..." button still hover-lifts and looks clickable (also in the 1.1 deferred list) [components/ui/button-primary.tsx:36]
- [x] [Review][Defer] Landing form copy contradicts itself and is shared with the results screen — `EmailCapture` hardcodes "(facoltativa)" but the landing action rejects an empty email; consent text is identical to the results screen while FR-13 says "own consent copy" [components/ui/email-capture.tsx:27] — deferred, pending OQ-3 copy decision
- [x] [Review][Defer] No rate limit, honeypot or captcha on the public Server Action — bots can flood `email_signups` [lib/actions/submitLandingEmailSignup.ts:21] — deferred, pre-existing (same exposure as `submitQuizCompletion`; architecture-level)
- [x] [Review][Defer] Consent copy is still placeholder pending OQ-3 legal text [components/ui/email-capture.tsx:57] — deferred, pre-existing
- [x] [Review][Defer] Consent sent via a hidden input mirrored from React state, and the checkbox has no `name` — submits before hydration always fail the consent check [components/landing/email-signup-form.tsx:35] — deferred, pre-existing (same pattern as results-screen)
- [x] [Review][Defer] A11y: success `role=status` mounts already filled (may not be announced, and focus is lost when the button unmounts); server error `role=alert` not linked to the input via `aria-describedby`/`aria-invalid` [components/landing/email-signup-form.tsx:25-40] — deferred, pre-existing (same pattern as results-screen)
- [x] [Review][Defer] Same Tailwind v4 focus-ring bug still in `answer-option.tsx` and `star-rating.tsx` [components/ui/answer-option.tsx] — deferred, pre-existing
- [x] [Review][Defer] **HIGH — pre-launch blocker:** no way to withdraw consent (GDPR art. 7(3)) even though the copy promises it; needs an unsubscribe path plus deletion/`consent_withdrawn_at` for both `email_signups` and `quiz_completions.email` [components/ui/email-capture.tsx:58] — deferred, out of scope for 1.5

## Dev Notes

### Dev Note: new table needed — this is a real infrastructure decision, not busywork

No existing architecture document anticipates a second Supabase table. `quiz_completions` is the only table in `ARCHITECTURE-SPINE.md`/`SOLUTION-DESIGN.md`. This story adds `email_signups` as a sibling table, following the **exact same access pattern** already established and enforced by `lib/data/README.md`'s ESLint rule: one named function per table, in `lib/data/`, `server-only`, secret-key-only via RLS-deny-all. This is a natural, low-risk extension of an existing pattern, not a new architecture — but flag it in your completion notes since no ADR explicitly named this table ahead of time (same spirit as Story 3.3's own region-drift disclosure).

### Why a separate table instead of reusing `quiz_completions`

The proposal is explicit that landing signups and post-quiz signups are "distinct, never merge." Reusing `quiz_completions` (which has a required-looking `score` column semantically tied to a finished quiz) for a visitor who never touched the quiz would be a schema/semantic mismatch. A separate minimal table (`email_signups`) keeps both paths honest about what they represent — don't try to force one table to serve both.

### Reuse `EmailCapture` as-is — don't fork it

`components/ui/email-capture.tsx` is already a controlled, presentation-only component (`email`/`onEmailChange`/`consent`/`onConsentChange` props, no submission logic of its own) — it was built generic enough in Story 3.2 to be reused here without modification. Wrap it in this story's own form/local state, same shape as `ResultsScreen` already does; don't copy-paste its JSX into a new component.

### Architecture compliance (must follow)

- **AD-5 pattern (extended, not in the original AD-5 text but same spirit):** Server Action is the sole path to the new table; secret key only, never `NEXT_PUBLIC_`-prefixed.
- **AD-6-equivalent (ADR-003, `lib/data/README.md`):** no `supabase.from(...)` outside `lib/data/emailSignup.ts` — this is lint-enforced (`no-restricted-syntax` in `eslint.config.mjs`), a violation fails the build, not just a style nit.
- **AD-8:** `email-signup.tsx`'s form island is a new, narrowly-scoped `'use client'` boundary — acceptable under the same reasoning Story 1.1 used for `PageViewTracker` (a small, non-competing island, not a violation of "Client Component islands only around `components/quiz/`/`components/feedback/`" in spirit, since this is a genuinely new, isolated interactive surface DESIGN.md/ARCHITECTURE-SPINE.md never anticipated). If this feels like it should be a formal architecture decision instead of a per-story call, flag it — same caveat Story 1.1's original Dev Notes raised for its own analytics-boundary decision.
- **AD-9:** `email_signup_landing` fires only through `lib/analytics/track.ts` against the fixed list — same wrapper, new event name.
- **AD-11:** single Supabase project — do not provision a second project or a second set of env vars for this table.

### Project Structure Notes

- New files: `components/landing/email-signup.tsx`, `lib/actions/submitLandingEmailSignup.ts`, `lib/data/emailSignup.ts`, a new migration file (follow the naming convention of the existing `supabase/migrations/0001_quiz_completions.sql`, e.g. `0002_email_signups.sql`).
- Modified: `lib/analytics/events.ts`, `app/page.tsx`.
- Reused unchanged: `components/ui/email-capture.tsx`, `components/ui/button-primary.tsx`, `lib/supabase/client.ts` (same `getSupabaseClient()`, no changes needed there).
- No test framework in this repo — verify manually, same approach as every prior story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5] — canonical ACs
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md] — why this section exists, explicit independence from Story 3.2
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-13] — requirement text
- [Source: lib/data/quiz.ts, lib/actions/submitQuizCompletion.ts, lib/supabase/client.ts, lib/data/README.md] — exact pattern to replicate for the new table/action/data-access function
- [Source: components/ui/email-capture.tsx] — component reused unchanged
- [Source: _bmad-output/implementation-artifacts/3-2-optional-email-capture-with-consent.md, 3-3-quiz-completion-write-cookieless-analytics.md] — sibling email-capture story and the Server Action pattern this story's action mirrors

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-09-27: Story created per `sprint-change-proposal-2026-09-27.md` — new landing email signup section, independent of the post-quiz email capture.
- 2026-09-27: Implemented Story 1.5 — `email_signups` table (RLS, zero policies) provisioned on the live Supabase project, `insertEmailSignup` data function, `submitLandingEmailSignup` Server Action, `EmailSignupSection` + `EmailSignupForm` client island mounted between comparison and footer, `email_signup_landing` analytics event. Fixed a Tailwind v4 focus-ring bug in `EmailCapture`/`ButtonPrimary` needed for AC #5. Status → review.
- 2026-09-27: Code review — 5 patches applied (dedupe via unique lowercase email + upsert ignoreDuplicates, per-row consent record `consent_given_at`/`consent_text_version`, email max 254, server-side error log, `ButtonPrimary` disabled styling). Status → in-progress until migration `0003` is applied to the live Supabase project (until then inserts fail: new columns/constraint missing).

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- `npx eslint app components lib` — 0 errors/warnings (includes the ADR-003 `no-restricted-syntax` rule; `supabase.from` only in `lib/data/emailSignup.ts`)
- `npm run build` — clean compile, TypeScript pass, `/` still prerendered static
- Migration applied with a temporary Node + `pg` script (installed in a scratch dir, not the repo) via the Supabase pooler `aws-0-eu-west-3.pooler.supabase.com:6543`. The direct host `db.<ref>.supabase.co` failed with `ENOTFOUND` (IPv6-only, same as Story 3.3). Verified after apply: columns `id uuid default gen_random_uuid()`, `email text not null`, `created_at timestamptz not null default now()`; `relrowsecurity = true`; 0 policies.
- Browser test with Playwright against the running dev server (390px and 1280px):
  - Submit with a valid email and no consent → `role=alert` "Serve il tuo consenso per iscriverti.", email kept, nothing written
  - Keyboard only: email → Tab → checkbox (Space) → Tab → button (Enter) → confirmation "Grazie! Ti scriveremo al lancio."; console shows `[analytics] email_signup_landing` exactly once, 0 errors/warnings
  - Computed focus ring on email / checkbox / button under `:focus-visible`: `solid` ink outline; none when blurred
- Supabase check after the browser submit: secret key reads 1 row (`id,email,created_at`); publishable key read → 0 rows; publishable insert → "new row violates row-level security policy"; `quiz_completions` has 0 rows with the test email (paths stay separate). Test row deleted afterwards.

### Completion Notes List

- All 6 ACs implemented and verified in a real browser. This is the first story in the repo checked with live browser interaction rather than only rendered HTML.
- **New table flagged (per Dev Note):** `email_signups` is a sibling of `quiz_completions` that no ADR named in advance. It follows the same access pattern (one `lib/data/` function, `server-only`, secret key only, RLS deny-all). Worth adding to ARCHITECTURE-SPINE.md next time it is reconciled.
- **Client-island file split:** the story lists only `components/landing/email-signup.tsx`, but a file can't be both a Server Component and `"use client"`. `email-signup.tsx` is the server section wrapper (`EmailSignupSection`); the form island is `components/landing/email-signup-form.tsx` (`EmailSignupForm`). The island is the narrowly scoped client boundary described in the AD-8 note; no ADR change proposed.
- **Focus-ring bug fixed (deviation from "reuse `EmailCapture` unchanged"):** AC #5 was failing before any 1.5 code ran. In this Tailwind v4 build, `outline-none` (and `outline-hidden`) set `--tw-outline-style: none`, and `focus-visible:outline` / `outline-2` read that same variable, so the ring computed to `outline-style: none` on every focusable element. Fix, class names only (no JSX fork): `outline-hidden` at rest plus `focus-visible:outline-solid` in `components/ui/email-capture.tsx` and `components/ui/button-primary.tsx`. `ButtonPrimary` is shared, so the hero CTA/header (Story 1.1) and the results screen now also get a visible ring.
- **Not fixed (out of scope, same bug):** `components/ui/answer-option.tsx` and `components/ui/star-rating.tsx` still use `outline-none` + `focus-visible:outline*`, so they have no visible focus ring. Belongs to Epic 2/3 surfaces; fix with the same class swap.
- Consent is enforced server-side: without `consent === "true"` the action returns an error and writes nothing. Email is Zod-validated (`trim().email()`) on the server; `EmailCapture`'s blur-time format check is client UX only.
- `EmailCapture`'s label still says "(facoltativa)", as it did when reused unchanged, although the landing form rejects an empty email. AC #1 literally says "optional, format-validated only", so this was left as is. Worth a copy decision.
- Observed, not changed: on landing load the console also logs `[analytics] quiz_started`, because `QuizFlow` is still mounted on the landing. That belongs to Story 2.1-REV, which moves the quiz off the landing.

### File List

- `supabase/migrations/0002_email_signups.sql` (new)
- `lib/data/emailSignup.ts` (new)
- `lib/actions/submitLandingEmailSignup.ts` (new)
- `components/landing/email-signup.tsx` (new)
- `components/landing/email-signup-form.tsx` (new)
- `lib/analytics/events.ts` (modified — added `email_signup_landing`)
- `app/page.tsx` (modified — mounted `EmailSignupSection` after `ComparisonSection`)
- `components/ui/email-capture.tsx` (modified — focus-ring class fix only)
- `components/ui/button-primary.tsx` (modified — focus-ring class fix only)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — 1-5 status)
- `supabase/migrations/0003_email_signups_dedupe_consent.sql` (new — review patch: unique lowercase email, consent columns; **not yet applied to live DB**)
- `lib/consent.ts` (new — review patch: `CONSENT_TEXT_VERSION`)
