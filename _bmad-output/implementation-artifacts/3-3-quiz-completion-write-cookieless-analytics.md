---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 3.3: Quiz Completion Write & Cookieless Analytics

Status: done

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> **Retired (FR-11 / spec CAP-11).** The landing no longer writes `quiz_completions`; `submitQuizCompletion` and `lib/data/quiz.ts` are deleted. Completion is measured by the `quiz_completed` analytics event, fired after `gradeQuiz` succeeds (props `score`, `total`). Analytics vendor decided: Umami Cloud (not wired until the PO account exists). Kept `done` as historical record, like 1.4.

## Story

As the product owner,
I want exactly one validated completion record saved per finished quiz, with reliable analytics,
so that I can measure completion rate and email opt-in without risking spoofed or duplicate data.

## Acceptance Criteria

1. **Given** the visitor has reached the results screen (Story 2.3) and optionally set a star rating (Story 3.1) and/or email+consent (Story 3.2) **When** the visitor submits the final-screen form **Then** the submission goes through exactly one Server Action (`lib/actions/submitQuizCompletion.ts`, `'use server'`), called via `useActionState` + `<form action>`, never an imperative fetch from an event handler.
2. **And** the Server Action receives the raw list of given answers (`{ questionId: number, selectedOptionId: string }[]`), not a pre-computed score, and recomputes the score server-side from `lib/content` before writing — a tampered client cannot submit a false score.
3. **And** `completedAt` is stamped server-side (`new Date().toISOString()`), never accepted from the client.
4. **And** the Supabase insert writes one `quiz_completions` record containing score, feedback (if present), email (if present and consent was checked), and timestamp — using the server-side secret key read only from server env (never a `NEXT_PUBLIC_`-prefixed var); RLS denies all access except this key.
5. **And** zero records are created if the quiz was abandoned before reaching the results screen.
6. **And** if the write fails (e.g. network drop), the results screen's score and mnemonic recap remain fully visible, and a small inline non-blocking error appears near the feedback/email area only.
7. **And** the Server Action returns `{ ok: true }` or `{ ok: false, error: string }` and never throws to the client for expected validation failures.
8. **And** the `quiz_completed` analytics event fires through `lib/analytics/track.ts` only after the Server Action returns `{ ok: true }` — never optimistically on submit.
9. **And** no cookie consent banner is shown anywhere in the funnel.

## Tasks / Subtasks

- [x] Task 1: Provision the Supabase table (AC: #4)
  - [x] `supabase/migrations/0001_quiz_completions.sql` — `quiz_completions(id uuid pk, score int, feedback smallint 1-5 check, email text, completed_at timestamptz)`, RLS enabled with **zero policies** (denies anon/publishable access by construction; the secret key bypasses RLS by design, matching AD-5's "RLS denies all access except this key")
  - [x] Applied against the live project (region **eu-west-3**, not eu-central-1/Frankfurt as ARCHITECTURE-SPINE.md's AD-1/AD-11 assumed — flagging the drift explicitly, see Dev Note; still EU, so NFR-3 residency intent holds)
- [x] Task 2: `lib/supabase/client.ts` (AC: #4) — server-only (`import "server-only"`) Supabase client built from `SUPABASE_URL`/`SUPABASE_SECRET_KEY` server env vars, plus `insertQuizCompletion()` mapping the camelCase `QuizCompletionRecord` to the table's snake_case columns (per ARCHITECTURE-SPINE.md's naming rule — mapping happens only inside `lib/supabase/`)
- [x] Task 3: `lib/actions/submitQuizCompletion.ts` (AC: #1, #2, #3, #6, #7)
  - [x] `'use server'` + `import "server-only"`, signature `(prevState, formData) => Promise<{ok:true} | {ok:false,error:string}>` for `useActionState`
  - [x] Zod v4 schema: `answers` parsed from a JSON string field (`z.string().transform(...)` → `z.array({questionId: z.coerce.number(), selectedOptionId: z.string()})`), `feedback` via `z.coerce.number().min(1).max(5)` or empty string, `email` via `z.string().email()` or empty string — matches ARCHITECTURE-SPINE.md's "`feedback` coerced from FormData string to number via zod, not passed as a JS number" rule
  - [x] Score recomputed from `getQuestions()` (AD-6) by matching `answers` against `correctOptionId` — never trusts a client-supplied score
  - [x] `completedAt = new Date().toISOString()` set inside the action, never read from `formData`
  - [x] `email` only included in the insert when `consent === "true"` (a hidden field mirroring `ResultsScreen`'s `consent` state, read independently of the Zod-validated email string) — feedback and the write itself proceed regardless of consent (Story 3.2's independence rule, AC #4 here)
  - [x] Insert errors caught and returned as `{ ok: false, error: "Invio non riuscito. Riprova." }`, never thrown
- [x] Task 4: Wire the form into `components/quiz/results-screen.tsx` (AC: #1, #5, #6, #8)
  - [x] `"use client"` added (first directive on this file — needed for `useActionState`/`useState`/`useEffect`); still nested inside `QuizFlow`'s existing client boundary, no new route
  - [x] `useActionState(submitQuizCompletion, null)` drives the form; hidden inputs carry `answers` (JSON-stringified), `feedback` (from Story 3.1's `rating` state, empty string when `0`), and `consent` (from Story 3.2's `consent` state) — `email` is the existing named input inside `EmailCapture`
  - [x] Explicit "Invia" submit button (`ButtonPrimary` with a new `type="submit"` pass-through, `compact` variant) rather than auto-firing the write on mount — chosen because the visitor is expected to *set* their rating/email on this screen first (see Dev Note); AC #1's "automatically... or via explicit submit — per the final-screen form" phrasing leaves the choice open
  - [x] On `{ok:false}`, inline error renders near the feedback/email area; score and mnemonic recap (rendered above, unconditionally) are untouched (AC #6)
  - [x] `useEffect` fires `track("quiz_completed")` only when `state?.ok` becomes true (AC #8) — `quiz_completed` was already in `lib/analytics/events.ts`'s fixed list (added when the list was scaffolded, unused until now)
  - [x] Form only exists on the results screen, which is itself only reachable by finishing all 10 questions (Story 2.3) — an abandoned quiz never renders this form, so AC #5 holds by construction, nothing extra to build
- [x] Task 5: Verify AC #9 (no cookie banner) — confirmed by inspection, nothing in `app/` or `components/` renders a consent banner; `lib/analytics/track.ts` remains a no-op until a cookieless provider (OQ-4) is actually wired, consistent with prior stories

## Dev Notes

### Explicit "Invia" button, not auto-submit-on-mount

The AC text allows either firing automatically on reaching the results screen or via explicit submit. Auto-firing on mount was rejected here: Story 3.1/3.2 put the star rating and email fields *on* the results screen precisely so the visitor can react after seeing their score — an immediate auto-submit on mount would capture `rating=0, email=""` before the visitor ever touches those controls, and AD-2's "exactly one completion write" rules out a second write to pick up a later change. An explicit submit button is the only way to satisfy both "one write" and "feedback/email actually reach that write."

### Region drift: eu-west-3 (Paris), not eu-central-1 (Frankfurt)

ARCHITECTURE-SPINE.md's AD-1/AD-11 say "Supabase (Postgres, EU-Frankfurt)". The project actually provisioned (this story, by the PO per OQ-5) is **eu-west-3 (Paris)**. Both are EU regions, so NFR-3's actual requirement (EU data residency) is satisfied — but the architecture doc's specific region name is now stale. Not fixing the architecture doc in this story (out of scope for a dev-story pass); flagging here so it's visible to whoever reconciles ARCHITECTURE-SPINE.md next.

### Architecture compliance (must follow)

- **AD-2:** exactly one write, this story — no mid-quiz writes exist anywhere else in the codebase (Epic 2 stories verified this already).
- **AD-5:** Server Action is the sole path to Supabase; secret key read only via `process.env.SUPABASE_SECRET_KEY` inside `lib/supabase/client.ts` (server-only, enforced by the `server-only` package — a Client Component importing it is a build error); `lib/actions/`/`lib/supabase/` both carry `import "server-only"`.
- **AD-6:** score recomputation uses `getQuestions()`, not a direct `questions.ts` import.
- **AD-9:** `quiz_completed` fires only through `lib/analytics/track.ts`, only after `{ok:true}`.
- **AD-11:** single Supabase project, no dev/prod split — the `.env`-sourced credentials serve local dev directly; production/Preview env vars in Vercel project settings are a deployment-time task, not part of this story's code.

### Project Structure Notes

- New files: `lib/supabase/client.ts`, `lib/actions/submitQuizCompletion.ts`, `supabase/migrations/0001_quiz_completions.sql`.
- `components/quiz/results-screen.tsx` (Stories 2.3, 3.1, 3.2) modified again — gains `"use client"`, the `<form action={formAction}>` wrapper, and the submit button. `components/ui/button-primary.tsx` (Story 1.1) modified minimally: `type` prop now passes through (was hardcoded `type="button"`, which silently blocked native form submission) — a one-line, backward-compatible change, every existing call site keeps its default `"button"` behavior.
- `components/ui/email-capture.tsx` (Story 3.2) modified minimally: the email `<input>` gained `name="email"` so the browser's native `FormData` collection (used by `<form action>`) picks it up — no behavior change for existing callers.
- Credentials live in `.env` (already gitignored via the blanket `.env*` rule in `.gitignore` — confirmed before writing anything). Vercel project env vars for Preview/Prod are a deployment task, not covered here.
- No test framework in this repo — verified via a real `npm run build` (clean) plus a standalone Supabase insert/delete/RLS-read smoke test against the live table (confirmed: secret key can insert, publishable key's read returns zero rows under RLS). The actual browser form-submission flow (fill rating/email, click Invia, see confirmation) was **not** exercised — same interaction-testing limitation as every story since 2.2, no browser automation available this session.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-9, FR-10, FR-11] — feedback/email independence, server-side score recompute, single completion write
- [Source: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md#AD-2, AD-5, AD-6, AD-9, AD-11] — Server Action boundary, secret-key-only access, content accessor, analytics wrapper, single-project rule
- [Source: _bmad-output/implementation-artifacts/3-1-feedback-box.md, 3-2-optional-email-capture-with-consent.md] — `rating`/`email`/`consent` local state this story wires into the actual submission

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-08-02: Implemented Story 3.3 — provisioned `quiz_completions` table (RLS, zero policies) on the live Supabase project (eu-west-3), added `lib/supabase/client.ts` and `lib/actions/submitQuizCompletion.ts` (Zod v4-validated Server Action, server-side score recompute, server-stamped timestamp), wired an explicit-submit form into `ResultsScreen` with `useActionState`, fired `quiz_completed` only on `{ok:true}`. Minimal supporting edits: `ButtonPrimary` gained a pass-through `type` prop, `EmailCapture`'s input gained `name="email"`. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated, `.env` picked up automatically by Next
- Standalone Node script against the live Supabase project (removed after use, not committed): secret key insert succeeded and cleaned up; publishable key read against the same row returned zero rows — confirms RLS is actually enforced, not just configured

### Completion Notes List

- All 9 ACs implemented. As with every Epic 2/3 story this session, the live browser interaction (typing an email, clicking a star, submitting, seeing the confirmation or error state) was not exercised — verified via build success + a direct Supabase-level smoke test of the write/RLS path instead, which is a stronger signal than prior stories had (this is the first story to actually touch a live external system).
- Table migration run via a temporary Node script using the `pg` package (installed with `--no-save`, uninstalled after) against the Supabase **pooler** connection (`aws-0-eu-west-3.pooler.supabase.com:6543`), not the direct host — the direct host (`db.<ref>.supabase.co`) only resolved to an IPv6 address in this environment, which was unreachable (`ENETUNREACH`); the pooler resolved IPv4 and worked. Worth knowing if a future migration needs re-running from a similarly IPv6-limited environment.
- Caught a real credential mismatch during setup: the password the user pasted in chat appeared in two different casings across two fields (connection-string field vs. standalone `psw:` field) — the connection string's casing was wrong; the standalone field was correct. Verified by testing both against the live pooler before writing `.env`, rather than guessing. **(Redacted 2026-09-27 — this note originally quoted the literal password in both casings; see security note below.)**
- Chose an explicit "Invia" submit button over auto-submit-on-mount — see Dev Note above; this is a real interpretation call on an ambiguous AC, not an oversight, and is called out explicitly in case product wants the auto-fire behavior instead (which would need a design answer for what happens to feedback/email set *after* an auto-fired write, e.g. a second update call — out of scope for this story as specified).
- Did not build a retry *control* (button) for the inline error, only the inline error message itself — AC #6 says "small inline non-blocking error" but doesn't explicitly require a distinct retry affordance beyond the fact that the same "Invia" button is still present and re-clickable (the form isn't removed/disabled on failure, only re-enabled after `isPending` resolves) — flagging as a minimal-but-compliant reading rather than over-building a separate "Riprova" control.

### File List

- `supabase/migrations/0001_quiz_completions.sql` (new)
- `lib/supabase/client.ts` (new)
- `lib/actions/submitQuizCompletion.ts` (new)
- `components/quiz/results-screen.tsx` (modified — `"use client"`, `useActionState` form wiring, submit button, post-success/error UI)
- `components/ui/button-primary.tsx` (modified — `type` prop now passes through instead of being hardcoded)
- `components/ui/email-capture.tsx` (modified — email input gained `name="email"`)
- `.env` (new, gitignored — `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DATABASE_URL`, `SUPABASE_REGION`; not committed)
