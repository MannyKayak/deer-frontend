---
baseline_commit: 0a49ef9dfd007bcae962695d9b716fe7bb97341e
supersedes: Story 2.2 as implemented in commit 0a49ef9 (was Status: done)
change_trigger: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md
---

# Story 2.2: Answer Selection, Lock & Advance (Revised — no per-question reveal)

Status: review

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> Implemented as specified (lock on tap, neutral "Avanti", no reveal). Last question's button reads "Vedi i risultati". Answers keyed `{ questionId, optionId }` (uuids). No network call during the quiz.
>
> Verified 2026-09-28: `tsc --noEmit`, `eslint app components lib`, `next build` pass; `/quiz` played in browser against live Supabase (question 953) — wrong path (✗ + mnemonic), correct path (✓ only), Ritenta (reshuffled options). Code review pending.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to pick an answer and move on without being told right away if I was right,
so that I experience the quiz as a real test of memory, with the payoff (and any mnemonic) waiting for me at the end.

## Acceptance Criteria

1. **Given** Story 2.1-REV's quiz flow is in place (on `/quiz`) and a question is displayed **When** the visitor taps any answer option **Then** the tapped option switches to a neutral `answer-option-selected` state (primary-color border, low-opacity primary background) and **locks immediately** — no correct/incorrect signal is shown, no mnemonic box appears, and the visitor **cannot** change their pick afterward (all other options become disabled the instant one is tapped).
2. **And** an "Avanti" `button-primary` becomes available once an option is selected; on the last question the same button reads "Vedi i risultati" (amended in code review 2026-09-28).
3. **When** the visitor taps "Avanti" **Then** the visitor advances to the next question (or triggers the results screen after the last question, per Story 2.3-REV) — "Avanti" never reveals correctness and never shows a mnemonic; it only records the answer and moves forward, preserving all previously given answers in the same in-memory state.
4. **And** at no point between question 1 and the results screen does any network write occur; a page refresh at any point during the quiz returns the visitor to question 1 with no progress restored (FR-7, unchanged).
5. **And** all interactive elements (answer options, "Avanti") are reachable and operable by keyboard alone with a visible custom focus state (not the default browser outline).
6. **And** the following are explicitly removed from the quiz's in-progress screens (moved to Story 2.3-REV's results screen instead): the `answer-option-correct`/`answer-option-incorrect` visual states, the ✓/✗ marks, the per-question `mnemo-box`, and the old "Conferma"→"Continua" two-step button label change.

## Tasks / Subtasks

- [ ] Task 1: Simplify `components/quiz/quiz-flow.tsx`'s state machine (AC: #1, #3, #4)
  - [ ] Remove the `confirmed` state entirely — there is no reveal step anymore, only select-and-lock
  - [ ] Keep `currentIndex`, `answers`, `selectedOptionId`, `finished` (finished stays a concern of this file, results-screen rendering is Story 2.3-REV's job)
  - [ ] `handleSelect(optionId)`: if `selectedOptionId !== null` for the current question, ignore the tap (already locked) — record the answer into `answers` **immediately on selection**, not on a separate confirm step (there is no confirm step anymore)
  - [ ] `handleAdvance()` (renamed from `handleConfirm`): resets `selectedOptionId` to `null` and either increments `currentIndex` or sets `finished = true` on the last question — mirrors the old advance logic minus anything reveal-related
- [ ] Task 2: Simplify `AnswerOption` usage in the quiz question card (AC: #1, #6)
  - [ ] The rendered `state` per option is now only `"default"` or `"selected"` during the quiz — never `"correct"`/`"incorrect"` here (those states remain valid on the component itself, just unused on this screen; Story 2.3-REV uses them on the results screen)
  - [ ] `disabled={selectedOptionId !== null}` on every option once one is picked (was `disabled={confirmed}`)
- [ ] Task 3: Update the advance button (AC: #2, #3, #6)
  - [ ] Single label "Avanti" always — remove the `confirmed ? "Continua" : "Conferma"` ternary
  - [ ] Remove the `<MnemoBox>` render entirely from the quiz question screen (it only ever appeared when `confirmed` was true, which no longer exists)
- [ ] Task 4: Verify keyboard operability and no-network-write guarantee (AC: #4, #5) — same verification approach as the original story

### Review Findings

_Code review 2026-09-28 (Blind Hunter + Edge Case Hunter + Acceptance Auditor, combined review of 2.1–2.3, 3.1, 3.2)._

- [ ] [Review][Patch] (Decision resolved: send after grading) Move mnemonics out of the `QuizFlow` payload into the `gradeQuiz` response — was: Mnemonics sent to the browser before answering — `app/quiz/page.tsx` passes every question incl. mnemonic text + signed image URLs into the `QuizFlow` client island. Not rendered, but inspectable in the payload (CAP-6: "no mnemonic appear during the quiz"). Accept, or move mnemonics into the `gradeQuiz` response.
- [ ] [Review][Patch] (Decision resolved: keep label) Amend AC #2/#3 to allow "Vedi i risultati" on the last question — was: Last question's button reads "Vedi i risultati" — AC #2/#3 and CAP-6 say advancing requires "Avanti". Amend the AC or change the label [components/quiz/quiz-flow.tsx:83].
- [ ] [Review][Patch] Fast double-tap can record two answers for one question (no dedupe by `questionId` in `setAnswers` updater); `gradeQuiz` also doesn't reject duplicate `questionId`s → score like "11/10" [components/quiz/quiz-flow.tsx:46-49, lib/actions/gradeQuiz.ts:7-15]

## Dev Notes

### Exact diff against the current `quiz-flow.tsx`

Current code (`components/quiz/quiz-flow.tsx`) tracks `selectedOptionId` + `confirmed` and does a two-phase select→confirm→reveal→continue. New behavior collapses this to select-and-lock→advance:

```ts
// OLD handleSelect: only updates selectedOptionId if !confirmed (pick changeable pre-confirm)
// NEW handleSelect: ignore if selectedOptionId !== null (locked on first tap); otherwise
//   set selectedOptionId AND push { questionId: question.id, selectedOptionId: optionId } to answers
//   in the same handler — there's no later "confirm" moment to defer the push to.

// OLD handleConfirm: two branches (record+confirm, then reset+advance)
// NEW handleAdvance: one branch — reset selectedOptionId to null, then advance currentIndex or set finished.
```

The per-option `state` computation in the JSX drops the `confirmed`/`isCorrectOption` branches entirely:
```ts
// OLD: state = !isSelected ? "default" : !confirmed ? "selected" : isCorrectOption ? "correct" : "incorrect"
// NEW: state = isSelected ? "selected" : "default"
```

### Architecture compliance

- **AD-2/AD-7 unchanged:** still zero network calls, still all state in `quiz-flow.tsx`'s `useState`.
- **AD-4:** `AnswerOption`'s `correct`/`incorrect` states are not deleted from the component — they're still needed by Story 2.3-REV's results screen. Don't remove them from `components/ui/answer-option.tsx`; just stop passing them from `quiz-flow.tsx`.

### Dev Note: this story stops at "advance" — the results breakdown is Story 2.3-REV

Same sequencing boundary as the original story: when `finished` becomes true, Story 2.3-REV's `ResultsScreen` renders the actual per-question breakdown. Don't build that here — this story's scope ends at correctly setting `finished = true` and handing off `answers`/`questions` to whatever renders next.

### Project Structure Notes

- Only file touched: `components/quiz/quiz-flow.tsx`. `AnswerOption`, `MnemoBox`, `QuizCard`, `CategoryTag`, `ButtonPrimary` are unchanged components — this story only changes which states/props `quiz-flow.tsx` passes to them (and stops passing `MnemoBox` at all on this screen).
- No test framework in this repo — verify manually: tap an option, confirm all others disable and no reveal/mnemo-box appears, tap "Avanti", confirm advance, repeat through question 10, confirm hand-off to `finished`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2] — canonical revised ACs
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md] — why immediate reveal was removed
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-6 (revised)] — no-immediate-feedback requirement
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#Interaction Primitives, #State Patterns] — revised tap-locks-no-reveal behavior
- [Source: components/quiz/quiz-flow.tsx] — actual current implementation read in full for this revision (see Dev Notes exact diff above)
- [Source: _bmad-output/implementation-artifacts/2-1-quiz-flow-start-single-question-presentation.md] — Story 2.1-REV, the route this quiz now lives on

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-09-27: Story revised per `sprint-change-proposal-2026-09-27.md` — removed the select→confirm→reveal two-step flow; tap now selects and locks immediately with no reveal, single "Avanti" button advances. Status reset to `ready-for-dev`.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
