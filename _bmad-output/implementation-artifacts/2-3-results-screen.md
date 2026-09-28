---
baseline_commit: 0a49ef9dfd007bcae962695d9b716fe7bb97341e
supersedes: Story 2.3 as implemented in commit 0a49ef9 (was Status: done)
change_trigger: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md
---

# Story 2.3: Results Screen (Revised — per-question breakdown + Ritenta)

Status: review

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> **AC amendments:**
> - AC #1: score is **not** computed client-side — `is_correct` is unreadable by anon. `ResultsScreen` calls the `gradeQuiz` Server Action, which calls `check_answer` per answer (`P0002`/`22023` → wrong). Shown as "N/{total} corrette"; loading state while grading, error state with "Riprova".
> - AC #2: rows show category, question text, "✓ Corretta" or "✗ Sbagliata" (text + icon, NFR-1); wrong rows show the mnemonic (text and/or image).
> - AC #3: "Ritenta" resets state and reshuffles options client-side; no DB record is produced (Story 3.3 retired).
> - AC #4: superseded — there is no completion write; grading is a read.
>
> Verified 2026-09-28: `tsc --noEmit`, `eslint app components lib`, `next build` pass; `/quiz` played in browser against live Supabase (question 953) — wrong path (✗ + mnemonic), correct path (✓ only), Ritenta (reshuffled options). Code review pending.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor who just finished the quiz,
I want to see my score and, for every question, whether I got it right and what I missed,
so that I recognize what I actually remembered, not just how many I got right.

## Acceptance Criteria

1. **Given** the visitor has answered question 10 and tapped "Avanti" (Story 2.2-REV) **When** the results screen renders **Then** it displays the score as "N/10 corrette", computed client-side from the in-memory answers collected during the quiz.
2. **And** it lists all 10 questions with their resolved state: correct answers show a checkmark only (no mnemonic); incorrect answers show the `mnemo-box` (🔑 Mnemotecnica) with that question's mnemonic text.
3. **And** a "Ritenta" `button-primary` is present; tapping it restarts the same 10 questions from question 1, resetting the quiz's in-memory state (`currentIndex`, `answers`, `selectedOptionId`, `finished` all back to their initial values) — a subsequent completion produces a new, independent record (Story 3.3, unaffected by this revision).
4. **And** the score and per-question breakdown are computed and rendered independently of any backend call — they remain fully visible even if a later completion write (Epic 3) fails.
5. **And** the results screen is reachable only by completing all 10 questions in sequence — there is no route or URL that resurrects or skips to this state.
6. **And** correct/incorrect state on each row is never conveyed by color alone — paired with the checkmark (correct) or the mnemo-box's presence (incorrect), per NFR-1.

## Tasks / Subtasks

- [ ] Task 1: Rewrite the per-question list in `components/quiz/results-screen.tsx` (AC: #2, #6)
  - [ ] For each question, find the visitor's answer (`answers.find(a => a.questionId === question.id)`) and compute `isCorrect = answer?.selectedOptionId === question.correctOptionId`
  - [ ] Correct row: category tag + question text + "✓ Corretta" label only (CAP-8: correct → checkmark only) — no `MnemoBox` _(amended in code review 2026-09-28)_
  - [ ] Incorrect row: "✗ Sbagliata" label, the chosen option via `<AnswerOption state="incorrect" disabled>`, the correct option via `<AnswerOption state="correct" disabled>` (`correctOptionId` from `gradeQuiz`), then `<MnemoBox>` (mnemonic from `gradeQuiz`, only if text or image exists) _(amended in code review 2026-09-28)_
  - [ ] Remove the old unconditional "list every mnemonic regardless of correctness" block entirely — it's fully superseded by the per-row logic above
- [ ] Task 2: Add "Ritenta" (AC: #3)
  - [ ] `QuizFlow` needs to pass an `onRetry: () => void` prop down to `ResultsScreen` — `onRetry` resets `currentIndex`, `answers`, `selectedOptionId`, `finished` to their initial values (same as the component's first mount)
  - [ ] `ResultsScreen` renders a `<ButtonPrimary onClick={onRetry}>Ritenta</ButtonPrimary>`
  - [ ] After retry, `quiz_started` firing again is acceptable (it's a genuinely new attempt) — don't suppress it
- [ ] Task 3: Verify AC #1, #4, #5 — unchanged from the original story, re-confirm they still hold after the rewrite (score computation logic itself doesn't change, only what's rendered per question)

### Review Findings

_Code review 2026-09-28 (Blind Hunter + Edge Case Hunter + Acceptance Auditor, combined review of 2.1–2.3, 3.1, 3.2)._

- [x] [Review][Dismissed] (Decision 2026-09-28: keep as is — "Riprova" alone on grading failure is accepted) Grading failure hides everything — on `!grading.ok` only an error + "Riprova" show: no "Ritenta", no feedback, no email (CAP-9: feedback "never gates the rest of the final screen"). Keep as is, or render the feedback/email form + Ritenta in the error state too [components/quiz/results-screen.tsx:89-106].
- [ ] [Review][Patch] (Decision resolved: show them) Return `correctOptionId` from `gradeQuiz`; wrong rows show the chosen option (incorrect) + the correct one via `AnswerOption` — was: Results don't show the chosen or the correct option — Task 1 still says render `<AnswerOption state="correct"/"incorrect">`, amended AC #2 doesn't require it; `gradeQuiz` drops `correctOptionId`. Show them, or update Task 1/Dev Notes to match the amended AC.
- [ ] [Review][Patch] Mnemonic with only an image whose signing failed renders an empty "🔑 Mnemotecnica" frame (CAP-15) — render `MnemoBox` only if text or imageUrl exists [components/quiz/results-screen.tsx:134]
- [ ] [Review][Patch] "Riprova" grading retry is never cancellable (`runGrading(() => false)`) — can set state after unmount / double-fire `quiz_completed` [components/quiz/results-screen.tsx:97-100]
- [ ] [Review][Patch] Story record empty — all task checkboxes `[ ]`, Dev Agent Record / File List blank in 2.1–2.3 despite `review` status [_bmad-output/implementation-artifacts/2-1..2-3]
- [x] [Review][Defer] `gradeQuiz` caps answers at 200 but `getFreeQuestions` has no limit — >200 free questions makes every grading fail [lib/actions/gradeQuiz.ts:15] — deferred, pre-existing

## Dev Notes

### What actually exists today (read before editing)

`components/quiz/results-screen.tsx` currently renders the score header, then **unconditionally lists every question's mnemonic** via `MnemoBox` regardless of correctness ("Ecco tutte le mnemotecniche che hai incontrato."). That entire block is replaced by the per-question correct/incorrect breakdown described in Task 1. The feedback (`StarRating`) and email (`EmailCapture`) form below it — wired in Story 3.1/3.2/3.3 via `useActionState(submitQuizCompletion, ...)` — is **untouched by this story**; it stays exactly as-is, just now rendered below the new breakdown instead of below the old unconditional mnemonic list.

### Retry needs a callback from the parent — this is the one structural change to `quiz-flow.tsx`

`ResultsScreen` today is a pure presentational component fed `questions`/`answers` as props, with no way to reset its parent's state. Adding "Ritenta" requires `QuizFlow` to pass down a reset function:

```tsx
// quiz-flow.tsx, inside the `finished` branch:
if (finished) {
  return (
    <ResultsScreen
      questions={questions}
      answers={answers}
      onRetry={() => {
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedOptionId(null);
        setFinished(false);
      }}
    />
  );
}
```

This is additive to `quiz-flow.tsx` — it does not conflict with Story 2.2-REV's rewrite of the select/advance logic, as long as both stories' changes to that file are applied together (they touch the same file but different concerns: 2.2-REV changes the per-question interaction, 2.3-REV adds this one `onRetry` prop and its handler).

### Architecture compliance

- **AD-2/AD-6 unchanged:** no network call anywhere in this story; score/breakdown computed from in-memory `answers` + `getQuestions()`-sourced `questions`.
- **AD-4:** reuses `AnswerOption`'s existing `correct`/`incorrect` states (already built for the old in-quiz reveal, now repurposed here) and `MnemoBox`/`QuizCard`/`ButtonPrimary` unchanged — no new component needed for the breakdown row.
- **AD-7:** `onRetry`'s reset logic lives in `quiz-flow.tsx`'s existing `useState` set — no new file, no route.

### Project Structure Notes

- Modified: `components/quiz/results-screen.tsx` (rewritten breakdown section, new `onRetry` prop), `components/quiz/quiz-flow.tsx` (adds the `onRetry` handler passed to `ResultsScreen`).
- No new components needed — `AnswerOption`'s correct/incorrect states, built for the now-removed in-quiz reveal, find a new home here instead of being wasted.
- No test framework in this repo — verify manually: complete all 10 questions (mix of right/wrong on purpose), confirm correct rows show only a checkmark and incorrect rows show the mnemonic, tap "Ritenta", confirm the quiz restarts cleanly at question 1 with no leftover state.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — canonical revised ACs
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md] — why the breakdown + Ritenta were added
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-8 (revised)] — per-question breakdown + Ritenta requirement
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md#answer-option-correct/incorrect] — reused visual states for the breakdown rows
- [Source: components/quiz/results-screen.tsx, components/quiz/quiz-flow.tsx] — actual current implementation read in full for this revision
- [Source: _bmad-output/implementation-artifacts/2-2-answer-reveal-mnemonic-unlock-advance.md, 3-3-quiz-completion-write-cookieless-analytics.md] — sibling stories touching the same files; confirms the feedback/email form below this story's breakdown is untouched

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-09-27: Story revised per `sprint-change-proposal-2026-09-27.md` — per-question correct/incorrect breakdown (mnemonic shown only on wrong answers) replaces the old unconditional full mnemonic recap; added "Ritenta" to restart the quiz. Status reset to `ready-for-dev`.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
