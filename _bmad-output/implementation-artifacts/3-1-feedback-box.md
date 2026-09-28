---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 3.1: Feedback Box

Status: review

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> Star rating is no longer stored in Supabase (landing writes only mailing-list signups). On "Invia" it is sent as analytics event `quiz_feedback` with `rating` (1-5). Still optional and independent of the email field.

## Story

As a visitor on the results screen,
I want to leave a quick star rating of my experience,
so that I can express my reaction without it blocking anything else on the screen.

## Acceptance Criteria

1. **Given** the results screen from Story 2.3 is displayed **When** the visitor views the feedback area **Then** a 5-level star rating component renders with no pre-selected value (all stars unfilled by default).
2. **And** selecting a star is entirely optional and never gates visibility of the rest of the results screen (score, mnemonic recap, email field).
3. **And** the star rating exposes its current value and each star's role to assistive technology (not a bare row of unlabeled icons), per UX-DR13.
4. **And** the star rating is operable by keyboard alone with a visible custom focus state.

## Tasks / Subtasks

- [x] Task 1: Build `components/ui/star-rating.tsx` (AC: #1, #3, #4)
  - [x] `role="radiogroup"` wrapping 5 `role="radio"` buttons, each `aria-checked` on the current value, `aria-label` stating its position ("N stelle su 5")
  - [x] Filled stars use `--color-accent-gold` (same token as `mnemo-box`'s border, already established), unfilled use `--color-border-neutral` — no other color-only signal (position + `aria-checked` carry the state for AT, satisfying NFR-1/UX-DR13 alongside Story 2.2's precedent)
  - [x] Visible `focus-visible` ring, same pattern as `AnswerOption`/`ButtonPrimary`
  - [x] Controlled component: `value: number`, `onChange: (value: number) => void` — no internal fetch/state persistence
- [x] Task 2: Wire into `components/quiz/results-screen.tsx` (AC: #1, #2)
  - [x] `useState(0)` for `rating` (0 = none selected, matches "all stars unfilled by default")
  - [x] Render below the mnemonic recap; rendering is unconditional — never gated by anything else on the screen, and selecting a star doesn't hide/change any other section (AC #2 by construction, nothing to gate)
  - [x] No network call — rating stays local state; the actual submission wiring is Story 3.3's scope (`submitQuizCompletion` Server Action doesn't exist yet)

### Review Findings

_Code review 2026-09-28 (Blind Hunter + Edge Case Hunter + Acceptance Auditor, combined review of 2.1–2.3, 3.1, 3.2)._

- [ ] [Review][Patch] Empty submit (no rating, no email) returns `{ ok: true }` → "Grazie per il tuo feedback!" and the form disappears for good — disable "Invia" until something is filled [components/quiz/results-screen.tsx:35]
- [ ] [Review][Patch] Stale Dev Notes/Tasks in 3.1/3.2 ("no network call", "Story 3.3 does the submission") contradict the revision — update to match `submitResultsForm` [_bmad-output/implementation-artifacts/3-1, 3-2]
- [x] [Review][Defer] Feedback + completion data are silently dropped in production — `track()` is a no-op until Umami is wired (CAP-11 retired) [lib/analytics/track.ts] — deferred, pre-existing; launch blocker

## Dev Notes

> **Code review 2026-09-28:** the Dev Notes/Tasks below predate the submission wiring. Current behaviour: `submitResultsForm` in `results-screen.tsx` sends the rating as `quiz_feedback` independently of the email; an email is submitted via `submitEmailSignup` only with consent (otherwise silently withheld, AC #3); a failed signup never drops or re-sends the rating; "Invia" is disabled until a rating or an email is entered. Story 3.3 is retired.

### Scope boundary: this story ends at "the rating is capturable in local state"

Story 3.3 (`Quiz Completion Write & Cookieless Analytics`) is what actually sends `rating` anywhere. This story only needs the control to exist, render correctly, and hold a value — same "stops at the seam" pattern Story 2.2 used for the results hand-off (see that story's Dev Notes). Don't add a submit handler or Server Action call here.

### Architecture compliance (must follow)

- **AD-2 (no mid-quiz writes):** results screen already has zero network calls (Story 2.3); this story must not introduce one.
- **AD-7:** `rating` state lives in `results-screen.tsx`'s own `useState` — no new route, no lifted global state (nothing downstream needs it yet).
- **AD-4:** reuses the existing color tokens (`accent-gold`, `border-neutral`) rather than inventing new ones — same discipline as Story 2.2's `AnswerOption` states.

### Project Structure Notes

- New file: `components/ui/star-rating.tsx` — sits alongside `answer-option.tsx`/`button-primary.tsx` as a reusable primitive, not quiz-specific despite only being used on the results screen today.
- `components/quiz/results-screen.tsx` (Story 2.3) modified — third component in the quiz subtree to gain local state after `quiz-flow.tsx`, still no `'use client'` directive needed (nested inside `QuizFlow`'s existing client boundary).
- No test framework in this repo — verify manually. Interaction (clicking a star, confirming `aria-checked` moves, tabbing through) requires a browser; same limitation flagged in Stories 2.2/2.3 — not exercised live this session.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-9] — 5-level rating, optional, not a gate, independent of email field
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#State Patterns, #Accessibility Floor] — "no pre-selected value", "exposes current value + each star's role to AT"
- [Source: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md#AD-2, AD-4, AD-7] — no writes yet, reuse tokens, in-memory-only state
- [Source: _bmad-output/implementation-artifacts/2-3-results-screen.md] — `results-screen.tsx` this story extends

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-08-02: Implemented Story 3.1 — new `StarRating` component (`role="radiogroup"`/`role="radio"`, gold-filled/neutral-outline, keyboard + focus-visible), wired into `ResultsScreen` with local `rating` state. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx tsc --noEmit` — clean, no type errors

### Completion Notes List

- All 4 ACs implemented. Same verification gap as every prior Epic 2/3 story: no browser automation available this session, so the actual click/keyboard interaction sequence wasn't exercised live — code inspection only.
- Used `role="radiogroup"`/`role="radio"` (mutually-exclusive single selection) rather than 5 independent toggle buttons — matches the "5-level rating" semantics (one value 1-5, not a multi-select) and gives assistive tech the standard radio-group announcement pattern for free.
- Deliberately did not add arrow-key roving-tabindex navigation (the ARIA APG's typical radiogroup pattern) — AC #4 only requires standard keyboard operability with visible focus, and each star is independently `Tab`-reachable/`Enter`-activatable like `AnswerOption`, which satisfies the stated AC without extra untested keyboard-handling code. Flagging as a deliberate scope call, not an oversight.

### File List

- `components/ui/star-rating.tsx` (new)
- `components/quiz/results-screen.tsx` (modified — `StarRating` wired in with local `rating` state)
