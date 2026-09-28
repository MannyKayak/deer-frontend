---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 1.4: In-Page Quiz Preview

Status: done

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> Retired (FR-4). Code removed 2026-09-28: `components/landing/quiz-preview.tsx` and `getPreviewQuestion()` (with all of `lib/content/`) deleted.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor evaluating before committing,
I want to see what a real quiz question looks like without starting the quiz,
so that I know what to expect before clicking the CTA.

## Acceptance Criteria

1. **Given** the landing page is in place and `lib/content/index.ts` exposes a `getPreviewQuestion()` accessor (per AD-6) reading from the versioned static content file **When** a visitor views the preview section **Then** a `quiz-card` renders a sample question with its category tag and question text, in the same visual shape as the real quiz card.
2. **And** the card is fully inert — tapping any option or the card itself does nothing, no mnemonic is ever revealed here **by interaction** (per FR-4, UX-DR15).
3. **And** the card uses the illustrative, always-visible `mnemo-box` and/or `floating-badge` treatment for decorative purposes only (per UX-DR6, UX-DR7), never gated by interaction.
4. **And** the preview card does not import the raw content data file directly — it goes only through the `lib/content` accessor (AD-6).
5. **And** clicking the real CTA elsewhere on the page (not this card) is what starts the actual quiz — this card has no such affordance.

## Tasks / Subtasks

- [x] Task 1: Author the static question dataset (AC: #1) — `lib/content/questions.ts`, 10 placeholder questions (per AD-3; real content is OQ-1, not this story). Each: `{ id: number, category: string, question: string, options: { id: string, text: string }[], correctOptionId: string, mnemonic: string }`.
- [x] Task 2: Build the content accessor `lib/content/index.ts` (AC: #1, #4) — exports `getQuestions()` (all 10, needed by Epic 2, AD-6's full stated contract) and `getPreviewQuestion()` (returns one fixed question, e.g. `questions[0]`, for this story). No component may import `questions.ts` directly — only through this module.
- [x] Task 3: Build `components/landing/quiz-preview.tsx` (AC: #1, #2, #3, #5)
  - [x] Reuse `QuizCard` + `CategoryTag` (Story 1.2/1.1) — same visual shape as the real quiz card
  - [x] Render question text + answer options as **plain, non-interactive** markup (no `onClick`, no `<button>` — see Dev Note on inertness below)
  - [x] Include an always-visible `MnemoBox` (Story 1.2) with the sample question's mnemonic — see Dev Note on the PRD/UX-DR6 tension below
  - [x] No CTA or click affordance anywhere on this card
- [x] Task 4: Mount the preview section in `app/page.tsx` (AC: #1) — placement: near the hero per EXPERIENCE.md's desktop two-column layout note, but that grid restructuring of `Hero` itself is out of scope here (see Dev Note); mount as its own section after `Hero`, before `ComparisonSection`, for now.
- [x] Task 5: Verify responsive rendering at 390px/1280px; verify nothing on the card responds to click/tap

## Dev Notes

### Architecture compliance (must follow)

- **AD-3 (static content in repo, not DB):** the 10 questions are versioned data files, no Supabase table this slice.
- **AD-6 (one content accessor):** `lib/content/index.ts` is the only entry point (`getQuestions()`, `getPreviewQuestion()`) — no component ever imports `questions.ts` directly. This is a hard architecture rule with a stated purpose (single seam for the later move to Supabase) — don't skip it "since it's just a preview."
- **AD-4 (components owned by DESIGN.md):** reuse `QuizCard` (Story 1.2), `CategoryTag` (Story 1.1), `MnemoBox` (Story 1.2) unchanged — do not fork variants of any of them for "preview mode." Pass different content as children/props instead.
- **AD-8 (Server Components by default):** static, no interactivity at all in this story — stays a Server Component.

### Dev Note: a real tension between PRD FR-4 and epics.md/DESIGN.md UX-DR6 — resolved in favor of epics.md

PRD FR-4's conseguenze literally say "nessuna mnemotecnica mostrata qui" (no mnemonic shown here). But `DESIGN.md` UX-DR6 says the `mnemo-box` is "shown pre-revealed as static illustration on the landing hero preview," and epics.md's own Story 1.4 AC #3 (above) explicitly asks for an "illustrative, always-visible `mnemo-box`... for decorative purposes only." These two source documents disagree. **Resolution used for this story: follow epics.md/DESIGN.md** (show the mnemo-box, always-visible, never interaction-gated) — it's the more downstream, implementation-authoritative document that synthesizes PRD+UX+Architecture, and its own Story 1.4 AC is unambiguous once "revealed" is read as "revealed **by interaction**" (AC #2) rather than "present at all" — the card has zero interaction, so anything shown is by definition static/always-visible, satisfying both AC #2 and AC #3 without contradiction. If this reading feels wrong, it's worth flagging up rather than silently reversing — this note exists so the discrepancy isn't lost.

### Dev Note: inertness — literal non-interactivity, not just "no listeners"

"Fully inert" (AC #2) means: render answer options as plain `<div>`/`<span>`, not `<button>`. Don't attach `onClick` and rely on it being unused — using semantically interactive elements (`<button>`, `<a>`) without a working handler is itself a UX/accessibility smell (looks clickable, isn't). No `tabIndex`, no `role="button"`, no `cursor-pointer` styling on the options.

### Dev Note: desktop hero-preview layout is explicitly deferred

EXPERIENCE.md describes the desktop hero as "a two-column grid (copy left, live preview `quiz-card` right)" — i.e. eventually the preview card sits *inside* the hero's grid on desktop. Restructuring `Hero` (Story 1.1, already in review) into a two-column grid to embed this preview is **not** part of this story's ACs, which only ask for the preview section to exist and render correctly at both breakpoints — not for a specific position relative to `Hero`. Mount it as an independent section for now (after `Hero`, before `ComparisonSection`). Revisiting `Hero`'s layout to nest the preview inside it is a reasonable follow-up but would expand this story's scope beyond its stated ACs — flag it rather than silently doing it.

### Project Structure Notes

- `Header`, `Hero`, `ComparisonSection`, `Footer` (Stories 1.1–1.3, all in `review`) already exist. This story adds `lib/content/` (new directory) and `components/landing/quiz-preview.tsx`.
- No test framework in this repo — verify manually against ACs, same approach as prior Epic 1 stories.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-4] — preview requirement (note the mnemonic-visibility discrepancy addressed above)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md#Components, #UX-DR6, #UX-DR7] — mnemo-box/floating-badge decorative-use spec
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#Component Patterns, #Responsive & Platform] — preview inertness rules, desktop hero-grid note (deferred, see Dev Note)
- [Source: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md#AD-3, AD-4, AD-6, AD-8] — content accessor contract, component reuse, server-only
- [Source: _bmad-output/implementation-artifacts/1-1-hero-with-cta.md, 1-2-comparison-section.md] — `QuizCard`/`MnemoBox`/`CategoryTag` already built, reuse unchanged

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-08-02: Implemented Story 1.4 — `lib/content/questions.ts` (10 placeholder Q&A), `lib/content/index.ts` accessor, `QuizPreview` component, mounted between `Hero` and `ComparisonSection`. Resolved a real PRD-vs-epics.md content-visibility discrepancy in favor of epics.md (documented in the story's Dev Notes). Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl`: verified the preview question/category/mnemonic text render; verified zero `<button>` elements exist on the page at all (both CTAs render as `<a>` via `ButtonPrimary`'s `href` branch, and the preview options are plain `<div>`s) — confirms the card has no interactive affordance anywhere, satisfying AC #2/#5 structurally, not just by omission of a click handler

### Completion Notes List

- All 5 ACs implemented and manually verified (same no-test-framework approach as prior Epic 1 stories).
- Flagged and resolved a genuine spec conflict: PRD FR-4 says no mnemonic should show on the preview; DESIGN.md UX-DR6 and epics.md's own Story 1.4 AC say an always-visible mnemo-box is expected. Implemented per epics.md/DESIGN.md (the downstream, implementation-authoritative documents) — see the story's Dev Notes for the full reasoning. Worth confirming with the PO/architect if this reading is wrong.
- Built the options list as plain `<div>` elements (not `<button>`), per the story's inertness Dev Note — avoids the "looks clickable, isn't" accessibility smell of using an interactive element with no handler.
- Authored all 10 placeholder questions now (not just the one the preview needs) since `lib/content/questions.ts` is a single data-authoring task and AD-6 already fixes the accessor's contract (`getQuestions()` + `getPreviewQuestion()`) — Epic 2's quiz flow can consume `getQuestions()` unchanged when it lands.
- Did not restructure `Hero` into EXPERIENCE.md's desktop two-column grid (copy left, preview right) — that AC isn't stated for this story and would have expanded scope into Story 1.1's already-reviewed component; mounted `QuizPreview` as an independent section instead (see Dev Note). Flagging as a known follow-up, not silently done.
- Same limitation as prior stories: no live browser/visual QA this session.

### File List

- `app/page.tsx` (modified — mounted `QuizPreview`)
- `lib/content/questions.ts` (new)
- `lib/content/index.ts` (new)
- `components/landing/quiz-preview.tsx` (new)
