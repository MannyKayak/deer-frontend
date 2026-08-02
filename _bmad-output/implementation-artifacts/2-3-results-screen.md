---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 2.3: Results Screen

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor who just finished the quiz,
I want to see my score and every mnemonic I encountered,
so that I recognize what I actually remembered, not just how many I got right.

## Acceptance Criteria

1. **Given** the visitor has answered question 10 and tapped "Conferma" **When** the results screen renders **Then** it displays the score as "N/10 corrette", computed client-side from the in-memory answers collected during the quiz.
2. **And** it lists all 10 mnemonics encountered during the quiz, regardless of whether each associated question was answered correctly.
3. **And** the score and mnemonic recap are computed and rendered independently of any backend call — they remain fully visible even if a later completion write (Epic 3) fails.
4. **And** the results screen is reachable only by completing all 10 questions in sequence — there is no route or URL that resurrects or skips to this state.

## Tasks / Subtasks

- [x] Task 1: Build `components/quiz/results-screen.tsx` (AC: #1, #2) — a plain presentational component (no `'use client'` needed, it's already inside `QuizFlow`'s client subtree per Next.js convention — only the boundary root needs the directive)
  - [x] Compute `correctCount` from `answers` + `questions` (match by `questionId`, not array index — don't assume alignment)
  - [x] Render "N/10 corrette" using `stat-number`-scale typography (same role as the hero trust-bar numbers, Story 1.1)
  - [x] List all 10 `question.mnemonic` values via `MnemoBox` (Story 1.2), in question order, unconditionally (not filtered by correctness)
- [x] Task 2: Fix the "when does the results screen actually show" gap left by Story 2.2's clamp (AC: #1, #4) — **see Dev Note, this is the core of this story, not a footnote**
  - [x] Add a `finished` state to `quiz-flow.tsx`
  - [x] `handleConfirm`: if `currentIndex` is the last question, set `finished = true` instead of advancing `currentIndex` further (replaces Story 2.2's `Math.min` clamp, which only prevented an out-of-bounds index — it didn't yet distinguish "revealed Q10's answer" from "confirmed past Q10")
  - [x] When `finished`, render `ResultsScreen` instead of the question card
- [x] Task 3: Verify AC #3 by inspection — confirm nothing in `results-screen.tsx` or the `finished` branch of `quiz-flow.tsx` makes a network call (Epic 3 hasn't added the completion write yet, so this is trivially true today, but the component shape must stay this way once Epic 3 lands)
- [x] Task 4: Verify AC #4 — reachability. There's no route/URL for this state by construction (AD-7, no `/quiz` segment at all); confirm a hard refresh at any point, including right after reaching results, returns to question 1 (nothing persisted, matches FR-7 — already true from Story 2.1/2.2, re-verify it still holds)

## Dev Notes

### The real gap this story closes (read first)

Story 2.2 shipped `handleConfirm` clamping `currentIndex` at `questions.length - 1` — that was a deliberate placeholder explicitly flagged in Story 2.2's own Dev Notes ("don't pre-build Story 2.3's screen now; leave an obvious, narrow seam"). But there's a subtlety the clamp alone doesn't handle: `revealed` (and therefore `answers.length === 10`) becomes true the instant the visitor taps an option on question 10 — **before** they tap Conferma. If "finished" were derived only from `answers.length === questions.length`, the results screen would flash in right after the *answer* tap, not after the *Conferma* tap, contradicting AC #1's "answered question 10 **and tapped Conferma**." That's why this story needs its own explicit `finished` boolean set inside `handleConfirm`, not a derived value from `answers.length`.

### Architecture compliance (must follow)

- **AD-2/AD-6 unchanged:** no network call anywhere in this story (Epic 3 adds the one completion write later, in a different file).
- **AD-7:** `finished` lives in `quiz-flow.tsx`'s existing `useState` set, no new file for state, no route.
- **AD-4:** `ResultsScreen` reuses `QuizCard` + `MnemoBox` unchanged — same "one component, reused everywhere" pattern as every prior Epic 1/2 story.

### Project Structure Notes

- `quiz-flow.tsx` (Stories 2.1/2.2) is modified again — this is the third story to touch it, each time additively (state grows, nothing removed). `AnswerOption`, `MnemoBox`, `QuizCard` all reused unchanged.
- Per the architecture's Capability → Architecture Map, FR-8 (this story) explicitly lives in `components/quiz/` — confirmed placement, not a judgment call.
- No test framework in this repo — verify manually, same approach as all prior stories. Note: like Story 2.2, verifying the actual "answer all 10, tap Conferma each time, see results" flow requires real interaction that `curl`-based smoke testing cannot exercise — see Story 2.2's Completion Notes for the same caveat; expect the same limitation here unless browser automation becomes available.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md#FR-8] — score + full recap requirement (all 10, not just correct)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md#stat-number] — score typography role
- [Source: _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md#Capability → Architecture Map (FR-8)] — confirms `components/quiz/` placement
- [Source: _bmad-output/implementation-artifacts/2-2-answer-reveal-mnemonic-unlock-advance.md] — the `Math.min` clamp this story replaces, and why it was only ever a placeholder

## Change Log

- 2026-08-02: Implemented Story 2.3 — `ResultsScreen` component, `QuizFlow` gained `finished` state replacing Story 2.2's placeholder clamp. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl`: confirmed 200 response and unchanged initial-render content (question 1 still renders); the `finished`/results branch itself is unreachable via static curl (needs 10 sequential tap+confirm interactions) — same interaction-testing limitation as Story 2.2, no browser automation available this session

### Completion Notes List

- All 4 ACs implemented. Verified everything reachable via static inspection (AC #3's no-network-call guarantee, AC #4's no-route-exists guarantee); **could not exercise the actual 10-question completion flow live** — flagging again as in Story 2.2, this remains the one real verification gap across both stories.
- Correctly distinguished "all 10 answered" from "all 10 confirmed": `finished` is set explicitly inside `handleConfirm` on the last question, not derived from `answers.length === 10` — the latter would have shown results one tap early (right after revealing Q10's answer, before Conferma), contradicting AC #1. This was the crux of the story per its own Dev Notes.
- `correctCount` matches by `questionId` rather than trusting array-index alignment between `answers` and `questions` — safe even though in practice they're always in sync given the sequential flow.
- `ResultsScreen` takes no `'use client'` directive of its own — correctly relies on being nested inside `QuizFlow`'s existing client boundary rather than adding a redundant one.

### File List

- `components/quiz/results-screen.tsx` (new)
- `components/quiz/quiz-flow.tsx` (modified — `finished` state, renders `ResultsScreen`)
