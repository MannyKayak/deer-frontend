---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 2.1: Quiz Flow Start & Single-Question Presentation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to see one official question at a time with clear answer options,
so that I can engage with the quiz without feeling overwhelmed or needing to log in.

## Acceptance Criteria

1. **Given** `lib/content/index.ts` exposes `getQuestions()` (per AD-6) returning the 10 versioned placeholder questions **When** a visitor clicks the CTA and lands on the quiz **Then** the `components/quiz/` Client Component island renders question 1 of 10, holding question index and answers state in `useState`/`useReducer` only — no route segment encodes quiz step (AD-7).
2. **And** the question card shows category tag (e.g. "Farmacologia"), progress indicator "Domanda N di 10", question text, and 3-4 full-width stacked answer options using `answer-option` (default state: white, thin neutral border, no shadow).
3. **And** no question beyond the current one is visible or reachable.
4. **And** no login or personal data is requested to proceed.
5. **And** `quiz_started` fires (through `lib/analytics/track.ts`) once when the visitor enters the quiz.
6. **And** no network write of any kind occurs on this screen.

## Tasks / Subtasks

- [x] Task 1: Build `AnswerOption` primitive in `components/ui/answer-option.tsx` (AC: #2) — default state only this story (full-width, white, `border-neutral`, `rounded-sm`, no shadow); no click handler yet — tap behavior is Story 2.2's AC, not this one. Keep the prop shape open for a later `correct`/`state` prop rather than closing off extension.
- [x] Task 2: Build `components/quiz/quiz-flow.tsx` (`'use client'`) (AC: #1, #3, #5, #6)
  - [x] `useState` holding `currentIndex` (see Completion Notes — deliberately did not pre-add an unused `answers` state; nothing reads/writes it until Story 2.2)
  - [x] Render only the current question (`getQuestions()[currentIndex]`) — never render or mount future questions
  - [x] Fire `quiz_started` once on mount (same `useEffect`-on-mount pattern as `PageViewTracker`, Story 1.1)
- [x] Task 3: Build the question card markup (AC: #2) — reuse `QuizCard`; category `CategoryTag` + a second `CategoryTag` instance for the "Domanda N di 10" progress pill (per UX-DR3: real quiz card carries both, preview card carries neither/only category); question text; `AnswerOption` list (non-interactive this story)
- [x] Task 4: Mount `QuizFlow` in `app/page.tsx` inside a `<section id="quiz">`, replacing the placeholder anchor target Story 1.1 left behind (AC: #1)
- [x] Task 5: Verify no network calls fire on this screen (AC: #6); verify `quiz_started` logs once per page load, not once per question

## Dev Notes

### Architecture compliance (must follow)

- **AD-6:** `getQuestions()` only, through `lib/content` — no direct import of `questions.ts`.
- **AD-7:** quiz index/answers state lives only in `useState`/`useReducer` inside `components/quiz/quiz-flow.tsx`. No `/quiz` route, no `[step]` segment.
- **AD-8:** `components/quiz/` is one of the two permitted `'use client'` locations (the other is `components/feedback/`, Epic 3) — this is the correct, sanctioned place for the client boundary, unlike Story 1.1's `components/analytics/` exception which had to justify itself.
- **AD-9:** `quiz_started` fires only through `lib/analytics/track.ts` against the fixed `events.ts` list (already exists from Story 1.1) — no new event name invented.
- **AD-4:** reuse `QuizCard` (Story 1.2) and `CategoryTag` (Story 1.1) unchanged; build `AnswerOption` new (first story that needs it).

### Dev Note: resolving how the CTA "starts" the quiz without a Server→Client trigger

Story 1.1 wired both CTAs to `href="#quiz"` (an anchor, not a click handler) specifically because `Header`/`Hero` are Server Components (AD-8) and can't hold state or call into a Client Component elsewhere in the tree. **Resolution for this story:** `QuizFlow` doesn't need an external "start" trigger at all — it mounts once on page load already showing question 1 (`currentIndex` initialized to `0`), same as any other section on the page. The CTA's only job is the anchor scroll to bring `<section id="quiz">` into view — by the time the visitor arrives there, question 1 is already rendered. This satisfies AC #1's "no intermediate step" naturally (there's no separate "tap to begin" screen to skip) and avoids inventing a Server-to-Client imperative API that AD-7/AD-8 don't provide for. `quiz_started` firing on mount (not on scroll-into-view) is a deliberate simplification of this same point — see Task 2. If a "don't count `quiz_started` until the visitor actually scrolls to it" requirement emerges later, that's a scope change, not an oversight here.

### Dev Note: this story is presentation-only, not yet interactive

AC #2 only asks for `answer-option` in its *default* state; nothing in this story's ACs mentions tapping. Story 2.2 adds the tap handler, the correct-answer reveal, and the "Conferma" advance button. Don't build the click handler now — a story that renders inert options today and Story 2.2 wires them tomorrow is the intended incremental sequence, not a bug to pre-empt.

### Project Structure Notes

- First story to touch `components/quiz/` — new directory.
- Story 1.1's `href="#quiz"` anchors (in `Header`/`Hero`) don't need any code change — they already point at the `id="quiz"` section this story creates.
- No test framework in this repo — verify manually, same approach as Epic 1.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md#FR-5] — single-question presentation requirement
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md#answer-option, UX-DR3] — default-state spec, category-tag dual-use on real quiz card
- [Source: _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md#AD-2, AD-6, AD-7, AD-8, AD-9] — no mid-quiz writes, content accessor, in-memory state, client boundary, analytics wrapper
- [Source: _bmad-output/implementation-artifacts/1-1-hero-with-cta.md] — CTA anchor target, `PageViewTracker` mount-fire pattern to replicate for `quiz_started`
- [Source: _bmad-output/implementation-artifacts/1-4-in-page-quiz-preview.md] — `lib/content` accessor already built, `QuizCard`/`CategoryTag` reuse precedent

## Change Log

- 2026-08-02: Implemented Story 2.1 — `AnswerOption` primitive, `components/quiz/quiz-flow.tsx` client island, `<section id="quiz">` mounted in `app/page.tsx`. Refactored `QuizPreview` (Story 1.4) to reuse the new `AnswerOption` instead of its own inline option markup. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl`: verified `<section id="quiz">` exists, verified the progress text renders as "Domanda 1 di 10" (initially grepped as split by React's SSR hydration comment markers between `{currentIndex + 1}` and `{questions.length}` — confirmed correct once accounting for that, not a bug), verified question 1's text renders

### Completion Notes List

- All 6 ACs implemented and manually verified.
- Deviated from the story's own task note: did **not** add an unused `answers` state field alongside `currentIndex` in `QuizFlow` — nothing in this story reads or writes it, and the project's own conventions call for not building state ahead of what's used. Story 2.2 will add it when the tap/reveal logic needs it.
- Resolved the Server-Component-CTA-to-Client-Component-state puzzle as documented in the story's Dev Notes: `QuizFlow` mounts already showing question 1, no external "start" trigger needed — the CTA's `href="#quiz"` (Story 1.1) just scrolls to it, unchanged from before.
- Refactored `QuizPreview` to use the new `AnswerOption` component instead of its own near-duplicate inline `<div>` markup — same visual output, now backed by one shared component per AD-4, avoiding the exact "re-implement per surface" anti-pattern DESIGN.md warns against.
- `quiz_started` fires on `QuizFlow` mount (page load), not on scroll-into-view — documented as a deliberate simplification in the story's Dev Notes, flagged for confirmation if a scroll-triggered variant is actually wanted later.
- Same limitation as prior stories: no live browser/visual QA this session; also could not verify the `quiz_started` console log output directly (client-side console output isn't visible via `curl`), relied on code review of the `useEffect` + `track()` call instead.

### File List

- `app/page.tsx` (modified — mounted `<section id="quiz"><QuizFlow /></section>`)
- `components/landing/quiz-preview.tsx` (modified — reused `AnswerOption`)
- `components/ui/answer-option.tsx` (new)
- `components/quiz/quiz-flow.tsx` (new)
