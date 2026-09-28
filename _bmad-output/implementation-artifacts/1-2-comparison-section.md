---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 1.2: Comparison Section

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a skeptical visitor,
I want to read a direct comparison between the traditional method and Remindeer's mnemonic approach,
so that I can judge whether the difference is real before starting the quiz.

## Acceptance Criteria

1. **Given** the landing page from Story 1.1 is in place **When** a visitor scrolls to the comparison section **Then** the section shows title "Perché non è l'ennesimo quiz" and subtitle "La differenza non è quante domande vedi, ma se te le ricordi il giorno dell'esame."
2. **And** the left column ("Metodo tradizionale") uses the `comparison-traditional` component (muted, flat, 85% opacity, no shadow) with the text "Un muro di 3000 domande uguali, da rileggere all'infinito sperando che restino in testa."
3. **And** the right column ("Con Remindeer") uses the `comparison-remindeer` component (inherits full `quiz-card` styling) with the mnemonic example text "Ogni domanda diventa un'immagine o un'associazione che si fissa in pochi secondi." and the closing line "Non studi di più: ricordi meglio."
4. **And** the layout is single-column stacked on mobile (390px) and two columns side-by-side on desktop (1280px) per FR-2 and UX-DR14.
5. **And** the visual weight contrast between the two columns is visibly asymmetric (traditional flatter/quieter, Remindeer bordered/shadowed) per UX-DR8.

## Tasks / Subtasks

- [x] Task 1: Build `QuizCard` and `MnemoBox` UI primitives in `components/ui/` (AC: #3) — **new components not anticipated by Story 1.1**, needed here because `comparison-remindeer` inherits `quiz-card` (UX-DR4/AD-4: `quiz-card` is a single component reused by FR-2 here, FR-4's preview in Story 1.4, and FR-5's real quiz in Epic 2 — build it generically now, not comparison-specific)
  - [x] `QuizCard` — white (`surface-raised`), 3px ink border, 20px radius (`rounded-md`), 7px flat ink shadow, `spacing.5` (22px) padding. Plain wrapper, no comparison-specific styling baked in.
  - [x] `MnemoBox` — gold-tinted background (`mnemo-bg`), 2px gold border (`accent-gold`), `rounded-sm` (10px), small-caps tag "🔑 Mnemotecnica" + body text
- [x] Task 2: Build `ComparisonTraditional` + `ComparisonRemindeer` components in `components/landing/` (AC: #2, #3, #5)
  - [x] `ComparisonTraditional` — `surface-muted` background, 2px `border-neutral`, `rounded-md`, 85% opacity, no shadow; a few flat skeleton placeholder lines behind/around the text standing in for "a wall of identical questions" (decorative only, not literal content)
  - [x] `ComparisonRemindeer` — wraps `QuizCard`, contains the `MnemoBox` (mnemonic example) + the closing line below it
- [x] Task 3: Assemble the comparison section in `components/landing/comparison-section.tsx` (AC: #1, #4)
  - [x] Title + subtitle
  - [x] Single column stacked on mobile; two columns side-by-side at the 1280px breakpoint (use `xl:` per Story 1.1's breakpoint-precision fix — DESIGN.md's desktop reference is exactly 1280px, not Tailwind's default `lg` 1024px)
- [x] Task 4: Mount the section in `app/page.tsx`, between `Hero` and the (not-yet-built) footer/preview (AC: #1)
- [x] Task 5: Verify responsive behavior at 390px and 1280px; verify the visual-weight asymmetry between columns is legible per UX-DR8 (AC: #5)

## Dev Notes

### Architecture compliance (must follow)

- **AD-4 (components owned by DESIGN.md):** `quiz-card`, `mnemo-box`, `comparison-traditional`, `comparison-remindeer` visual specs are fixed in DESIGN.md's `components` frontmatter — copy exact values (colors/radii/shadows/padding below), don't invent new ones.
- **AD-8 (Server Components by default):** this entire story is static, non-interactive content — `ComparisonTraditional`, `ComparisonRemindeer`, `QuizCard`, `MnemoBox` all stay Server Components, no `'use client'` needed anywhere in this story.
- **AD-10 (design tokens as theme):** all tokens needed here (`surface-muted`, `border-neutral`, `mnemo-bg`, `accent-gold`, `rounded-sm`/`rounded-md`) are already registered in `app/globals.css`'s `@theme` block from Story 1.1 — no new token registration needed, just consume the existing utility classes (`bg-surface-muted`, `border-border-neutral`, `bg-mnemo-bg`, `border-accent-gold`, `rounded-sm`, `rounded-md`).

### Dev Note: reuse `QuizCard`, don't build a one-off card

`comparison-remindeer` "inherits: quiz-card" per DESIGN.md — this is the **first** of three places `quiz-card` gets used (FR-2 here, FR-4's static preview in Story 1.4, FR-5's real quiz in Epic 2). Build `QuizCard` as a plain, unstyled-content wrapper (border/radius/shadow/padding only, `children` prop) in `components/ui/`, not as something comparison-specific — Story 1.4 and Epic 2 will import the exact same component. Getting this wrong (e.g. inlining the border/shadow classes directly into `ComparisonRemindeer` instead of extracting `QuizCard`) creates the exact "re-implement a card style per surface" anti-pattern DESIGN.md explicitly warns against (see its Do/Don't table: "Reuse the exact `quiz-card` component everywhere" / don't "Invent a new card style per surface").

### Exact token/spec values needed for this story

- `quiz-card`: `bg-surface-raised` (white), `border-2` → actually **3px** border in `text-primary` (ink) — DESIGN.md specifies `borderWidth: 3px` for `quiz-card` specifically (thicker than the 2px used on `category-tag`/`answer-option`); use an arbitrary-value border (`border-[3px]`) since Tailwind's default border scale doesn't include 3px, `rounded-md` (20px), shadow `7px 7px 0 {text-primary}` (heaviest in the system — arbitrary value `shadow-[7px_7px_0_var(--color-text-primary)]`, same pattern as `ButtonPrimary`'s shadow in Story 1.1), padding `spacing.5` = 22px (`p-[22px]`).
- `mnemo-box`: `bg-mnemo-bg`, `border-2 border-accent-gold`, `rounded-sm` (10px), padding `spacing.4` = 16px (`p-4` — Tailwind's default `p-4` is already 16px, matches DESIGN.md's token 4 exactly, safe to use the plain utility here unlike the `spacing.5`/22px case above).
- `comparison-traditional`: `bg-surface-muted`, `border-2 border-border-neutral`, `rounded-md`, `opacity-85` (Tailwind's default opacity scale doesn't have 85 either — use `opacity-[0.85]` or the closest built-in `opacity-85`... **verify**: Tailwind v4's default opacity scale is 0/5/10/.../90/95/100 in steps of 5, so `opacity-85` is a real, non-arbitrary utility — use it, don't reach for arbitrary value unnecessarily).
- Section title/subtitle: no new typography role beyond what Story 1.1 already established (`headline-section` role in DESIGN.md — Lexend 700, 30px/1.2 desktop, 20px/1.2 mobile-only-below-1280 per the same `xl:` pattern as the hero headline).

### Dev Note: skeleton placeholder lines (traditional column)

DESIGN.md describes the traditional column as having "skeleton placeholder lines standing in for 'a wall of identical questions'" — this is decorative, not literal question content (there's no real question data available yet; that's Epic 2's `lib/content` accessor, out of scope here). Implement as a few flat `bg-surface-muted-line` bars of varying width behind/alongside the column's text — purely visual texture, do not wire them to any data source.

### Project Structure Notes

- `Header`/`Hero`/design tokens/`ButtonPrimary`/`CategoryTag`/`LogoMark` already exist from Story 1.1 (currently in `review`, not yet code-reviewed) — this story adds to the same `components/ui/` and `components/landing/` directories, doesn't touch Story 1.1's files.
- No test framework in this repo (see Story 1.1's Dev Notes) — verify manually against ACs + the reference mockups, same approach as Story 1.1.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-2] — comparison requirement + exact copy strings
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md#Components (quiz-card, mnemo-box, comparison-traditional, comparison-remindeer), #Do's and Don'ts] — token values, reuse mandate
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#Component Patterns] — `quiz-card`/`mnemo-box` behavioral notes (pre-revealed/illustrative use here vs. real quiz)
- [Source: _bmad-output/planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md#AD-4, AD-8, AD-10] — component ownership, server-only, token registration
- [Source: _bmad-output/implementation-artifacts/1-1-hero-with-cta.md] — established token registration pattern, breakpoint-precision fix (`xl:` not `lg:`/`sm:`), `ButtonPrimary` shadow-utility pattern to replicate for `QuizCard`

## Change Log

- 2026-08-02: Implemented Story 1.2 — `QuizCard`/`MnemoBox` primitives, `ComparisonTraditional`/`ComparisonRemindeer` components, `ComparisonSection` assembled and mounted in `app/page.tsx` between `Hero` and the footer (not yet built). Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated
- `npx eslint app components lib` — 0 errors/warnings
- Manual smoke test via `npm run dev` + `curl`: verified all required copy strings render (title, subtitle, both column headings, mnemonic example text, closing line, traditional-column text); verified compiled CSS contains the arbitrary-value utilities used (`opacity:.85`, `3px` border, `7px 7px 0` shadow) rather than assuming Tailwind accepted them silently

### Completion Notes List

- All 5 ACs implemented and manually verified against rendered HTML + compiled CSS (same no-test-framework approach as Story 1.1).
- `QuizCard` built as a plain, content-agnostic wrapper per the story's Dev Note — `ComparisonRemindeer` composes it rather than duplicating its border/shadow classes, so Story 1.4 and Epic 2 can reuse it unchanged.
- Reused Story 1.1's `xl:` breakpoint convention (1280px, matching DESIGN.md's exact desktop reference) for the mobile→desktop column layout switch — no new breakpoint-precision issue this time since the precedent was already established.
- `opacity-85` used as a plain Tailwind utility (not arbitrary value) — confirmed Tailwind v4's default opacity scale includes steps of 5, so no override was needed.
- Skeleton placeholder lines in `ComparisonTraditional` are purely decorative (`aria-hidden`), not wired to any data source, per the story's Dev Note.
- Same limitation as Story 1.1: no live browser/visual QA this session (no browser automation available) — relied on rendered HTML + compiled CSS inspection instead of a visual screenshot comparison against the reference mockups.

### File List

- `app/page.tsx` (modified — mounted `ComparisonSection`)
- `components/ui/quiz-card.tsx` (new)
- `components/ui/mnemo-box.tsx` (new)
- `components/landing/comparison-traditional.tsx` (new)
- `components/landing/comparison-remindeer.tsx` (new)
- `components/landing/comparison-section.tsx` (new)
