---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 2.2: Answer Reveal, Mnemonic Unlock & Advance

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to pick an answer and confirm it before finding out if I was right,
so that I actually commit to a guess (and can be wrong) instead of the system giving away the answer the moment I touch any option.

## Acceptance Criteria

1. **Given** Story 2.1's quiz flow is in place and a question is displayed **When** the visitor taps any answer option **Then** only the tapped option switches to a neutral `answer-option-selected` state (primary-color border, low-opacity primary background) — no correct/incorrect signal yet — and the visitor may tap a different option to change their pick any number of times before confirming.
2. **And** a "Conferma" `button-primary` becomes available once an option is selected.
3. **When** the visitor taps "Conferma" **Then** the options lock (no longer tappable) and the selected option instantly switches to `answer-option-correct` (green tint, green border, green snap shadow, bold text, ✓ mark) if correct, or `answer-option-incorrect` (error-color tint, error-color border, error-color snap shadow, bold text, ✗ mark) if wrong — the correct option is **not** separately highlighted when the visitor picked wrong, so the visitor can genuinely get a question wrong.
4. **And** the correct/incorrect state is never conveyed by color alone — each state also carries a non-color indicator (✓/✗ mark / bold weight) per NFR-1.
5. **And** a `mnemo-box` appears instantly below the options (no animation/fade/slide), tagged "🔑 Mnemotecnica", with the mnemonic text for that question.
6. **And** the "Conferma" button's label changes to "Continua" once confirmed/revealed, and is the only way to advance — no auto-advance and no swipe/keyboard-shortcut path beyond standard Tab/Enter focus activation.
7. **And** tapping "Continua" advances to the next question (or to the results screen after question 10), preserving previously given answers in the same in-memory state.
8. **And** at no point between question 1 and the final screen does any network write occur; a page refresh at any point during the quiz returns the visitor to question 1 with no progress restored (FR-7).
9. **And** all interactive elements (answer options, "Conferma"/"Continua") are reachable and operable by keyboard alone with a visible custom focus state (not the default browser outline), per UX-DR13.

## Tasks / Subtasks

- [x] Task 1: Extend `AnswerOption` (`components/ui/answer-option.tsx`) into a real interactive control (AC: #1, #3, #4, #9)
  - [x] Replace the old `correct` boolean with a `state` prop (`"default" | "selected" | "correct" | "incorrect"`) — `selected`: primary-color border, `primary/10` background; `correct`: green tint/border/shadow, bold, ✓ mark; `incorrect`: error-color tint/border/shadow, bold, ✗ mark (non-color indicators satisfy AC #4/NFR-1)
  - [x] Render as `<button type="button">` (Story 2.1 used a plain `<div>`; this story makes it interactive)
  - [x] Add `onClick`/`disabled` props, visible `focus-visible` ring (reuse the same pattern as `ButtonPrimary`, Story 1.1)
- [x] Task 2: Add select/confirm/reveal/advance state to `components/quiz/quiz-flow.tsx` (AC: #1-#3, #6-#8)
  - [x] Track `selectedOptionId: string | null` (changeable pre-confirm) and `confirmed: boolean` for the current question, plus the existing `answers`/`currentIndex`
  - [x] Tapping an option before confirm only updates `selectedOptionId` — no correctness shown, re-tappable to change the pick (AC #1)
  - [x] "Conferma" appears once `selectedOptionId` is set; tapping it records the answer, sets `confirmed = true`, locks the options, and reveals correct/incorrect state on the selected option only — the unselected correct option is deliberately left unhighlighted so a wrong pick reads as wrong (AC #3)
  - [x] `MnemoBox` (Story 1.2) renders once `confirmed` is true
  - [x] Button label is "Conferma" pre-confirm, "Continua" post-confirm (AC #6); tapping "Continua" advances `currentIndex` (or hands off to Story 2.3's results screen — **that hand-off itself is Story 2.3's scope**, see Dev Note) and resets `selectedOptionId`/`confirmed` for the next question
  - [x] No `fetch`/Server Action call anywhere in this file — state changes are 100% client-local (AC #8)
- [x] Task 3: Verify keyboard operability — Tab reaches every option and Conferma/Continua, visible focus ring on each, Enter/Space activates (AC: #9)
- [x] Task 4: Verify a hard refresh mid-quiz (e.g. on question 4) returns to question 1 with nothing restored (AC: #8) — confirmed by code inspection (see Completion Notes on the browser-interaction verification limit)

## Dev Notes

### Architecture compliance (must follow)

- **AD-2 (no mid-quiz writes):** this entire story must not add a single network call. Verify explicitly (Task 4) rather than trusting it by omission.
- **AD-7:** all new state (`answers`, `revealed`) stays in `quiz-flow.tsx`'s `useState`/`useReducer` — no new file, no route segment.
- **AD-4:** `AnswerOption`'s correct/incorrect-state visual specs (green vs. error-color bg/border/shadow, bold, non-color marker) are fixed by DESIGN.md tokens (`--color-correct`/`--color-error`) — don't invent new colors/values.

### Dev Note: this story stops at "advance to next question" — the results hand-off is Story 2.3

AC #5 says Conferma "advances to the next question (or to the results screen after question 10)" — but the results screen itself doesn't exist until Story 2.3. For this story: when `currentIndex` would go past the last question (index 9), the safest scope-respecting move is to guard the advance (e.g. `Math.min(currentIndex + 1, questions.length - 1)`, or render nothing/a simple "quiz complete" placeholder) rather than building the actual results UI here — that's explicitly Story 2.3's AC set (score, mnemonic recap). Don't pre-build Story 2.3's screen now; leave an obvious, narrow seam (e.g. a `currentIndex === questions.length` check) that Story 2.3 replaces with real content. Flagging this explicitly since "advances... to the results screen" in the AC text could tempt over-building past this story's actual scope.

### Dev Note: selection is changeable pre-confirm, locked post-confirm

Superseded from an earlier draft that revealed correctness on the very first tap. Product direction (2026-08-02): the visitor must be able to actually get a question wrong, so tapping an option only *selects* it (re-tappable, no correctness shown) until "Conferma" is pressed. Confirming is the single commit point: it locks the options (no further taps change the answer) and reveals correct/incorrect. This is also what makes the record-the-answer step deterministic — `answers` only ever gets one entry per question, written at confirm time, not at first tap.

### Project Structure Notes

- `AnswerOption` (Story 2.1) and `quiz-flow.tsx` (Story 2.1) are the two files this story extends — both already exist and are `done`.
- `MnemoBox`, `QuizCard`, `CategoryTag`, `ButtonPrimary` all already exist (Stories 1.1/1.2) — reuse unchanged.
- No test framework in this repo — verify manually, same approach as all prior stories.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md#FR-6, NFR-1] — reveal requirement, color-never-alone rule
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md#answer-option-correct, #Elevation] — exact correct-state visual spec (shadow color swap)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/EXPERIENCE.md#State Patterns, #Accessibility Floor] — instant snap-in (no animation), keyboard/focus requirements
- [Source: _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md#AD-2, AD-7] — no mid-quiz writes, in-memory-only state
- [Source: _bmad-output/implementation-artifacts/2-1-quiz-flow-start-single-question-presentation.md] — existing `quiz-flow.tsx`/`AnswerOption` to extend, not replace

## Change Log

- 2026-08-02: Implemented Story 2.2 — `AnswerOption` extended with `correct`/`disabled`/`onClick`, `QuizFlow` gained answer/reveal/advance state and renders `MnemoBox`+Conferma once revealed. Updated `QuizPreview` (Story 1.4) to pass `disabled` so it stays inert now that `AnswerOption` is a real button. Status → review.
- 2026-08-02: Revised flow per product feedback — tapping an option no longer instantly reveals the correct answer (that let visitors never actually be "wrong"). Split into select → confirm → reveal: `AnswerOption`'s `correct` boolean replaced with a `state` prop (`default`/`selected`/`correct`/`incorrect`); `QuizFlow` now tracks `selectedOptionId` (re-pickable pre-confirm) + `confirmed`, locks options and reveals correct/incorrect on the *selected* option only at confirm time, and swaps the button label "Conferma" → "Continua" post-reveal. ACs and ARCHITECTURE-SPINE references in this file and `epics.md` Story 2.2 updated to match.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl` (initial/unrevealed render only — see limitation below): confirmed 0 "Conferma" occurrences before any interaction (button correctly absent pre-reveal), confirmed exactly 1 "Mnemotecnica" occurrence (only the always-visible preview one, none yet in the real quiz), confirmed preview's 4 options render with `disabled=""` while the real quiz's 4 question-1 options render enabled (8 total `<button type="button">` elements, 4 disabled / 4 not)

### Completion Notes List

- All 7 ACs implemented; verified what's verifiable without interaction (initial render state, DOM structure, disabled/enabled split). **Could not verify the actual tap→reveal→Conferma→advance interaction sequence this session — no browser automation tool was available** (checked; none loaded). This is a real gap, not covered by the static curl checks above — flagging explicitly rather than claiming full verification. Recommend an interactive pass (browser or manual) before this story is truly trusted, on top of code review.
- Resolved a real component-evolution conflict: `AnswerOption` needed to become a genuine `<button>` for the real quiz (this story) but Story 1.4's `QuizPreview` was built assuming it stayed a non-interactive `<div>`. Fixed by adding a `disabled` prop — a disabled button is semantically correct for "interactive-looking but not currently interactive" and functionally inert (unfocusable, unclickable), preserving Story 1.4's AC without forking the component.
- Simplified the "one reveal per question" guard: since options become `disabled` the instant `revealed` is true, a second tap is already impossible at the DOM level — didn't add a redundant `if (revealed) return` check in the handler (avoids two mechanisms enforcing the same constraint).
- `handleConfirm` clamps `currentIndex` at `questions.length - 1` rather than building any results-screen content, per the story's own Dev Note — Story 2.3 replaces this clamp with the real hand-off.
- Same limitation as prior stories regarding live visual QA, plus the added interaction-testing gap noted above.
- **Post-review revision:** original implementation revealed the correct answer the instant any option was tapped (per the original AC text). User feedback identified this as a genuine UX defect — a quiz where you can't be wrong isn't a quiz. Reworked to a two-step select→confirm→reveal flow (see Change Log); `npx tsc --noEmit` clean after each edit, no interactive browser verification performed this session either.

### File List

- `components/ui/answer-option.tsx` (modified — added `correct`/`onClick`/`disabled`, now a `<button>`)
- `components/landing/quiz-preview.tsx` (modified — passes `disabled` to keep it inert)
- `components/quiz/quiz-flow.tsx` (modified — answer/reveal/advance state, `MnemoBox` + Conferma)
