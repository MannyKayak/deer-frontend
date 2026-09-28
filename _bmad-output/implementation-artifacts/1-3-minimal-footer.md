---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 1.3: Minimal Footer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to find the product name and legal links at the bottom of the page,
so that I know who's behind the product and can find Privacy/Terms if needed.

## Acceptance Criteria

1. **Given** the landing page is in place **When** a visitor scrolls to the bottom of the page **Then** the footer renders as a full-bleed ink-colored band with text "Remindeer — mnemotecniche per il concorso farmacie" in the footer-text color, using the `footer` component (no border/shadow, per UX-DR9).
2. **And** "Privacy" and "Termini" links are present and point to placeholder routes/anchors (real legal copy is OQ-3, out of scope for this story).
3. **And** the footer renders correctly at both mobile (390px) and desktop (1280px) reference breakpoints.

## Tasks / Subtasks

- [x] Task 1: Build `Footer` component in `components/landing/footer.tsx` (AC: #1, #2)
  - [x] Full-bleed `footer-bg` background band, `footer-text` text color, no border/shadow (`footer` component per DESIGN.md — full-bleed ink band, warm off-white text, "it's the page's base plane, not a floating element")
  - [x] Text: "Remindeer — mnemotecniche per il concorso farmacie"
  - [x] "Privacy" and "Termini" links pointing to placeholder anchors (`#privacy`, `#termini` — no real pages exist yet, OQ-3 unresolved; do not fabricate legal copy)
- [x] Task 2: Mount `Footer` in `app/page.tsx`, after `ComparisonSection` (AC: #1)
- [x] Task 3: Verify responsive behavior at 390px and 1280px (AC: #3)

## Dev Notes

### Architecture compliance (must follow)

- **AD-4 (components owned by DESIGN.md):** `footer` component spec is fixed — full-bleed `footer-bg`/`footer-text`, no border/shadow. Both tokens already exist in `app/globals.css`'s `@theme` block from Story 1.1 (`--color-footer-bg: #221812`, `--color-footer-text: #d3cdbf`) — no new token registration needed.
- **AD-8 (Server Components by default):** static content, no interactivity — stays a Server Component, no `'use client'`.

### Dev Note: this is the smallest story in Epic 1 — don't over-build

No new UI primitives needed (unlike Story 1.2's `QuizCard`/`MnemoBox`). Don't invent a shared `Link` wrapper component for "Privacy"/"Termini" — two plain `<a>` tags are sufficient; there is no third or later reuse of a footer-link pattern anywhere in the epics. OQ-3's legal copy and page routes are explicitly deferred (see `ARCHITECTURE-SPINE.md#Deferred`) — placeholder anchors are the correct, complete scope for this story, not a shortcut to fix later.

### Project Structure Notes

- `Header`, `Hero`, `ComparisonSection` (Stories 1.1/1.2, both in `review`, not yet code-reviewed) already exist — this story only adds `components/landing/footer.tsx` and mounts it in `app/page.tsx` after `ComparisonSection`.
- No test framework in this repo — verify manually against ACs, same approach as Stories 1.1/1.2.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-3] — footer requirement + exact copy string
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md#Components (footer)] — token values
- [Source: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md#Deferred] — OQ-3 legal copy explicitly out of scope this slice
- [Source: _bmad-output/implementation-artifacts/1-1-hero-with-cta.md, 1-2-comparison-section.md] — established token/breakpoint conventions to reuse

## Change Log

- 2026-08-02: Implemented Story 1.3 — `Footer` component, mounted after `ComparisonSection` in `app/page.tsx`. Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl`: verified footer text and both link labels render

### Completion Notes List

- All 3 ACs implemented and manually verified (same no-test-framework approach as prior Epic 1 stories).
- No new UI primitive or token needed — reused `footer-bg`/`footer-text` tokens already registered in Story 1.1.
- Same limitation as Stories 1.1/1.2: no live browser/visual QA this session — relied on rendered HTML + build/lint checks.

### File List

- `app/page.tsx` (modified — mounted `Footer`)
- `components/landing/footer.tsx` (new)
