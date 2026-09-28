---
baseline_commit: 0a49ef9dfd007bcae962695d9b716fe7bb97341e
supersedes: Story 2.1 as implemented in commit 0a49ef9 (was Status: done)
change_trigger: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md
---

# Story 2.1: Quiz Flow Start & Single-Question Presentation (Revised — own route)

Status: review

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> Implemented together with 2.2/2.3 against Supabase instead of `lib/content`. **AC amendments:**
> - AC #1: `app/quiz/page.tsx` (Server Component, `await connection()`) loads every free question via `lib/data/questions.ts#getFreeQuestions()` (ordered by `official_number`) and passes them to `QuizFlow`; `lib/content` no longer exists.
> - AC #2: progress is "Domanda N di {total}", `total` = number of free questions; option count is whatever the question has (observed 5). Options identified by uuid, shuffled per request.
> - AC #7: CTAs use `href="/quiz"` via `ButtonPrimary`'s `<a>`.
> - Header rendered on `/quiz`; Footer also rendered (deviation from Task 1 note — revisit in review if single-focus framing matters).
>
> Files:
> - `app/quiz/page.tsx` (new), `app/page.tsx`
> - `components/quiz/quiz-flow.tsx`, `components/quiz/results-screen.tsx`
> - `components/ui/mnemo-box.tsx`, `components/ui/content-image.tsx` (new)
> - `lib/data/questions.ts`, `lib/data/types.ts`, `lib/data/emailSignup.ts`
> - `lib/actions/gradeQuiz.ts` (new), `lib/actions/submitEmailSignup.ts` (renamed from `submitLandingEmailSignup.ts`)
> - `lib/supabase/client.ts`, `lib/supabase/database.types.ts` (generated), `lib/quiz/shuffle.ts` (new)
> - Deleted: `lib/content/*`, `lib/actions/submitQuizCompletion.ts`, `lib/data/quiz.ts`, `lib/consent.ts`, `components/landing/quiz-preview.tsx`
>
> Verified 2026-09-28: `tsc --noEmit`, `eslint app components lib`, `next build` pass; `/quiz` played in browser against live Supabase (question 953) — wrong path (✗ + mnemonic), correct path (✓ only), Ritenta (reshuffled options). Code review pending.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to see one official question at a time with clear answer options,
so that I can engage with the quiz without feeling overwhelmed or needing to log in.

## Acceptance Criteria

1. **Given** `lib/content/index.ts` exposes `getQuestions()` returning the 10 versioned placeholder questions **When** a visitor clicks the CTA **Then** they land on a dedicated `/quiz` route (`app/quiz/page.tsx`) — the quiz is no longer mounted inline on the landing page. The `components/quiz/` Client Component island still holds question index and answers state in `useState`/`useReducer` only — no per-question route segment (AD-7 unchanged, only the container page moved).
2. **And** the question card shows category tag, progress indicator "Domanda N di 10", question text, and 3-4 full-width stacked answer options — unchanged from the existing implementation.
3. **And** no question beyond the current one is visible or reachable.
4. **And** no login or personal data is requested to proceed.
5. **And** `quiz_started` still fires (through `lib/analytics/track.ts`) once when the visitor enters `/quiz`.
6. **And** no network write of any kind occurs on this screen.
7. **And** both CTAs (`Hero`, sticky `Header`) navigate to `/quiz` (a real Next.js `<Link>`/navigation, not the old `href="#quiz"` in-page anchor).
8. **And** the landing page (`app/page.tsx`) no longer renders the quiz or its static preview — Story 1.4 (in-page quiz preview) is retired; its section and dead code are removed as part of this story (see Task 3).

## Tasks / Subtasks

- [ ] Task 1: Create `app/quiz/page.tsx` (AC: #1, #5)
  - [ ] Server Component page that renders `<QuizFlow />` (the existing `components/quiz/quiz-flow.tsx` Client Component island, unchanged in this story beyond what Story 2.2/2.3 touch)
  - [ ] Decide whether to also render `<Header />` on this route for brand consistency (not gated by any AC — reasonable to include, but not required; `<Footer />` is also rendered — accepted in code review 2026-09-28; the header CTA is hidden on `/quiz` via `showCta={false}` so it can't wipe progress)
- [ ] Task 2: Remove the inline quiz mount from `app/page.tsx` (AC: #8)
  - [ ] Delete the `<section id="quiz"><QuizFlow /></section>` block and its `QuizFlow` import
  - [ ] Delete the `<QuizPreview />` line and its import (Story 1.4 retirement)
  - [ ] Resulting `app/page.tsx` order: `Header`, `Hero`, `ComparisonSection`, `Footer` (Story 1.5 will insert the email-signup section between `ComparisonSection` and `Footer` — leave a clear gap there, don't fight over ordering if 1.5 lands first or after)
- [ ] Task 3: Delete `components/landing/quiz-preview.tsx` and its accessor (AC: #8)
  - [ ] Delete the file entirely (no other component imports it — verify with a repo-wide search for `QuizPreview` before deleting, don't assume)
  - [ ] Remove `getPreviewQuestion()` from `lib/content/index.ts` (verify it has no other callers first — currently only `quiz-preview.tsx` calls it)
- [ ] Task 4: Update CTA targets (AC: #7)
  - [ ] `components/landing/hero.tsx`: `<ButtonPrimary href="#quiz" arrow>` → `href="/quiz"`
  - [ ] `components/landing/header.tsx`: `<ButtonPrimary href="#quiz" variant="compact">` → `href="/quiz"`
  - [ ] `ButtonPrimary` already renders a plain `<a>` for the `href` case — a plain `<a href="/quiz">` triggers a full Next.js client-side navigation automatically inside the App Router, no `next/link` import strictly required, but using `next/link`'s `<Link>` is the more idiomatic choice if you want prefetching; either satisfies AC #7, pick one and don't mix
- [ ] Task 5: Verify (AC: #1–#8)
  - [ ] `npm run build` — confirm `/quiz` appears as a generated route
  - [ ] Confirm `app/page.tsx` no longer imports `QuizFlow`/`QuizPreview`
  - [ ] Confirm no dangling `getPreviewQuestion` references (`grep -r getPreviewQuestion`)
  - [ ] Confirm `quiz_started` still fires once per `/quiz` page load (unchanged `useEffect` in `QuizFlow`)

### Review Findings

_Code review 2026-09-28 (Blind Hunter + Edge Case Hunter + Acceptance Auditor, combined review of 2.1–2.3, 3.1, 3.2)._

- [ ] [Review][Patch] (Decision resolved: keep Footer) Amend Task 1 to accept `<Footer />` on `/quiz` — was: Footer rendered on `/quiz` — Task 1 says don't render `<Footer />` (competes with single-focus framing per EXPERIENCE.md); `app/quiz/page.tsx:33` renders it. Remove it, or amend the task to accept it.
- [ ] [Review][Patch] Header CTA "Prova il quiz gratis" on `/quiz` links to itself — a mid-quiz click reloads and wipes all answers [components/landing/header.tsx:13]
- [ ] [Review][Patch] No error boundary for `/quiz` — `getFreeQuestions()` throws on any Supabase error and the user gets the generic Next error page [app/quiz/page.tsx:17]
- [x] [Review][Defer] Signed image URLs expire after 1h (per CAP-15) and "Ritenta" reuses them; `ContentImage` has no `onError` fallback [components/ui/content-image.tsx] — deferred, pre-existing
- [x] [Review][Defer] Generic alt text on question/mnemonic images — schema has no alt field [components/quiz/quiz-flow.tsx:69] — deferred, pre-existing
- [x] [Review][Defer] A free question with zero options softlocks the quiz (no "Avanti") — backoffice data integrity [components/quiz/quiz-flow.tsx:71] — deferred, pre-existing
- [x] [Review][Defer] ESLint ADR-003 guard only matches identifiers named `supabase` (`getSupabaseClient().from()` passes) [eslint.config.mjs] — deferred, pre-existing

## Dev Notes

### What actually exists today

Quiz was previously built as a client island mounted **inline on the landing page** (`app/page.tsx`, `<section id="quiz">`), not on its own route — this was a deliberate choice at the time (see this story's original Dev Notes: "Structural Seed shows a single `app/page.tsx`, no `/quiz` route... Do not create a `/quiz` route"). The PO has since reversed that decision (`sprint-change-proposal-2026-09-27.md`): the quiz now needs to be its own page. This story is the one that makes that architectural move. AD-7 ("no route segment encodes quiz step") still holds — it was always about not having `/quiz/[step]` per-question segments, not about the quiz having no route at all.

Current `app/page.tsx` (read in full before editing):
```
<Header /><Hero /><QuizPreview /><section id="quiz"><QuizFlow /></section><ComparisonSection /><Footer />
```
Target order after this story: `<Header /><Hero /><ComparisonSection /><Footer />` (Story 1.5 inserts an email-signup section before `<Footer />`).

### Architecture compliance

- **AD-7:** unaffected — quiz index/answers state still lives only in `QuizFlow`'s `useState`. Moving the *container page* is not the same as adding a per-question route segment.
- **AD-8:** `app/quiz/page.tsx` stays a Server Component (like `app/page.tsx`); `QuizFlow` remains the sole `'use client'` boundary.
- **AD-6:** no change — `getQuestions()` still the only accessor used by the real quiz. `getPreviewQuestion()` is removed as dead code (its only caller, `QuizPreview`, is retired).

### Dev Note: don't let this story creep into Story 2.2/2.3 scope

This story is the **route move only**. Do not touch the select/reveal/advance interaction logic inside `quiz-flow.tsx` (Story 2.2-REV's job) or the results screen (Story 2.3-REV's job) beyond what's needed to relocate the component tree. If you're implementing all three stories in one session, it's fine to combine the work, but keep the AC-to-change mapping clear in the file list / completion notes.

### Project Structure Notes

- New file: `app/quiz/page.tsx`.
- Deleted files: `components/landing/quiz-preview.tsx`.
- Modified: `app/page.tsx`, `components/landing/hero.tsx`, `components/landing/header.tsx`, `lib/content/index.ts`.
- No test framework in this repo — verify manually (build + grep + manual click-through).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1] — canonical revised ACs
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md] — why the route move happened
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#Information Architecture] — `/quiz` as its own IA surface
- [Source: app/page.tsx, components/landing/hero.tsx, components/landing/header.tsx, components/landing/quiz-preview.tsx, lib/content/index.ts] — actual current implementation read in full for this revision
- [Source: _bmad-output/implementation-artifacts/2-1-quiz-flow-start-single-question-presentation.md @ commit 0a49ef9] — original story's reasoning for *not* having a route, now superseded

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-09-27: Story revised per `sprint-change-proposal-2026-09-27.md` — quiz moves to its own `/quiz` route; in-page preview (Story 1.4) removed. Status reset to `ready-for-dev`.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
