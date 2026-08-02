---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 3.2: Optional Email Capture with Consent

Status: done

## Story

As a visitor who found value in the quiz,
I want to optionally leave my email for launch updates,
so that I can be notified later without being forced to sign up now.

## Acceptance Criteria

1. **Given** the results screen from Story 2.3 is displayed **When** the visitor views the email area **Then** an email field renders clearly marked as optional, with a separate consent checkbox next to GDPR consent microcopy (placeholder copy acceptable pending OQ-3).
2. **And** the only blocking validation on the email field is a valid email format — an invalid format shows an inline validation message without blocking feedback submission or viewing the rest of the screen.
3. **And** if the visitor fills the email but leaves the consent checkbox unchecked, only the email value is withheld from the eventual completion submission — feedback (if given, Story 3.1) and the completion event itself (Story 3.3) are unaffected.
4. **And** the email field and checkbox are reachable and operable by keyboard alone with a visible custom focus state.

## Tasks / Subtasks

- [x] Task 1: Build `components/ui/email-capture.tsx` (AC: #1, #2, #4)
  - [x] Controlled `email`/`onEmailChange`, `consent`/`onConsentChange` props — no internal fetch, no persistence (this story stops at capturing local state, same seam pattern as Story 3.1)
  - [x] Label reads "Email (facoltativa)" — optional marking is textual, not color-only
  - [x] Validation only on blur (`touched`), only checks format via regex; error is a non-blocking inline `<p>` tied to the input with `aria-describedby`/`aria-invalid` — never disables the field or blocks anything else
  - [x] Consent checkbox rendered directly beside placeholder GDPR microcopy (flagged inline as `[ASSUMPTION: ... OQ-3]`, matching the PRD's own placeholder-copy allowance)
  - [x] Both controls are native `<input>` elements (real Tab targets by default) with the same `focus-visible` ring pattern as `AnswerOption`/`StarRating`
- [x] Task 2: Wire into `components/quiz/results-screen.tsx` (AC: #1, #3)
  - [x] `useState("")` for `email`, `useState(false)` for `consent`, both local to `ResultsScreen` — same level as Story 3.1's `rating`
  - [x] Rendered unconditionally below the feedback box; nothing on the screen is gated by these fields (mirrors Story 3.1's AC #2 handling)
  - [x] No derivation of a "final submittable email" value in this story — that's Story 3.3's job when it builds the actual submission payload; this story only needs `email` and `consent` to exist as independent, readable state for 3.3 to consume (AC #3's "only email withheld" rule is a Story 3.3 concern once a submission exists, not something to half-implement here without a target to feed)

## Dev Notes

### Scope boundary: independence, not withholding logic, is this story's job

AC #3 describes what should happen at *submission* time (email withheld, feedback/completion unaffected) — but there is no submission path yet (Story 3.3 hasn't built `submitQuizCompletion`). This story's actual scope is keeping `email` and `consent` as two independent state values that don't influence each other or the rest of the screen; the withholding logic itself belongs in Story 3.3, which will read `consent` to decide whether to include `email` in the write payload. Don't invent a submit handler here.

### Architecture compliance (must follow)

- **AD-2:** no network call added — still zero writes anywhere in the quiz/results flow.
- **AD-7:** `email`/`consent` are local `useState` in `results-screen.tsx`, same as Story 3.1's `rating` — no route, no lifted global state.
- **AD-4:** reused existing tokens (`border-neutral`, `error`, `primary-dark` via `accent-primary-dark`, `surface-raised`) rather than introducing new ones.

### Project Structure Notes

- New file: `components/ui/email-capture.tsx` — reusable primitive alongside `star-rating.tsx`, `answer-option.tsx`.
- `components/quiz/results-screen.tsx` (Stories 2.3, 3.1) modified again, additively — now holds `rating`, `email`, `consent`.
- No test framework in this repo — verify manually; same browser-interaction limitation as every prior story this session (no automation tool available).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md#FR-10, OQ-3] — optional email, format-only validation, placeholder consent copy allowance
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/EXPERIENCE.md#State Patterns, #Accessibility Floor] — inline validation non-blocking, email-withheld-not-everything-else rule, keyboard/focus requirements
- [Source: _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md#AD-2, AD-4, AD-7] — no writes yet, reuse tokens, in-memory-only state
- [Source: _bmad-output/implementation-artifacts/3-1-feedback-box.md] — sibling results-screen addition, same scope-boundary pattern (capture locally, submit later in Story 3.3)

## Change Log

- 2026-08-02: Implemented Story 3.2 — new `EmailCapture` component (email input with blur-triggered format validation, consent checkbox with placeholder GDPR copy), wired into `ResultsScreen` with independent `email`/`consent` local state. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx tsc --noEmit` — clean, no type errors

### Completion Notes List

- All 4 ACs implemented at the "local state capture" scope this story owns; AC #3's withholding behavior is modeled as independent `email`/`consent` state (correct precondition) but the actual withholding decision has no consumer yet — that's Story 3.3, flagged explicitly rather than pre-building a submission payload shape that might not match what 3.3 actually needs.
- Validation deliberately gated on `touched` (blur), not on every keystroke — avoids showing an error while the visitor is still mid-typing a valid address, consistent with AC #2's "non-blocking" framing.
- Consent copy is explicitly marked `[ASSUMPTION: ... OQ-3]` in the JSX as a comment, not just in this doc — keeps the placeholder-vs-real-copy distinction visible to whoever swaps in legal text later.
- Same interaction-testing gap as every story since 2.2: no browser automation available this session.

### File List

- `components/ui/email-capture.tsx` (new)
- `components/quiz/results-screen.tsx` (modified — `EmailCapture` wired in with local `email`/`consent` state)
