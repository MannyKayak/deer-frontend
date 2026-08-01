---
stepsCompleted: [step-01-validate-prerequisites]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/SOLUTION-DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/EXPERIENCE.md
  - _bmad-output/specs/spec-deer/SPEC.md
  - _bmad-output/specs/spec-deer/glossary.md
  - _bmad-output/project-context.md
---

# Deer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Deer (first public slice: landing page + quiz di assaggio), decomposing requirements from the PRD, the UX design contract (DESIGN.md + EXPERIENCE.md), the Architecture Spine + Solution Design, and the SPEC.md canonical contract into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-1: Hero with CTA toward the quiz — visitor sees hero (headline, subheadline, CTA, microcopy, trust bar) and starts the quiz in one tap/click, no intermediate step. Sticky header keeps a compact CTA reachable through scroll.

FR-2: Comparison section — visitor reads the "traditional method vs Deer" contrast before deciding to start the quiz. Single column on mobile, two columns side by side from desktop up.

FR-3: Minimal footer — visitor sees product name and Privacy/Termini links (link targets pending OQ-3).

FR-4: In-page quiz preview — visitor sees a non-interactive sample question card (same quiz-card shape as the real quiz) before deciding to start the real quiz. No clickable options, no mnemonic ever shown here.

FR-5: Single-question presentation — visitor sees one question at a time: category tag, "Domanda N di 10" progress indicator, question text, 3-4 full-width answer options. Next question never visible before the current one is answered. No login/personal data required.

FR-6: Answer reveal + mnemonic unlock — on tapping any option, the correct option is visually highlighted (independent of what was tapped); a mnemo box appears tagged "🔑 Mnemotecnica"; correctness is never color-only; advancing requires an explicit "Conferma" tap (no auto-advance).

FR-7: Progress not persisted server-side — no network write happens between question 1 and the final screen; a refresh mid-quiz returns to question 1; no record created for intermediate answers.

FR-8: Result + mnemonic recap — after question 10, visitor sees score ("N/10 corrette") and all 10 mnemonics encountered, regardless of which were answered correctly.

FR-9: Feedback box — 5-level star rating, optional, never gates the rest of the final screen; the feedback event is sent independently of whether email is filled.

FR-10: Optional email capture — field clearly marked optional; only blocking validation is email format; a separate consent checkbox must be checked before an entered email is submitted; the checkbox never blocks the completion event itself.

FR-11: Quiz-completed event write — exactly one Supabase (EU-Frankfurt) record per completion (score, optional feedback, optional email, server-stamped timestamp); zero records for abandoned quizzes; score recomputed server-side from submitted answers (never trusted from client); write goes through exactly one Server Action; Supabase secret key never reaches the browser.

FR-12: Cookieless analytics — `visit_landing`, `quiz_started`, `quiz_completed` fire through one tracking wrapper; `quiz_completed` fires only after the completion Server Action returns success (never optimistically); no cookie consent banner shown.

### NonFunctional Requirements

NFR-1 (Accessibility): correct/incorrect state never conveyed by color alone — always paired with icon or text (✓ mark + bold weight). Text/background contrast meets WCAG 2.1 AA on the DESIGN.md palette; `text-secondary` on `surface-muted` (comparison traditional column) is the lowest-contrast pairing and needs explicit verification.

NFR-2 (Performance): mobile-first, reference breakpoints 390px mobile / 1280px desktop. No quantitative performance budget (Lighthouse/Core Web Vitals) fixed for this slice — Server-Components-by-default judged sufficient by construction.

NFR-3 (Privacy): email and feedback data stored in Supabase EU (Frankfurt) per GDPR; no data collected without explicit consent (see FR-10 consent checkbox).

### Additional Requirements

- **Server-first Islands paradigm**: Server Components by default (`app/`, `components/landing/`); Client Component islands only around `components/quiz/` and `components/feedback/`; no `'use client'` at page level (AD-8).
- **Stack fixed**: Next.js (App Router) 16.2.12 + TypeScript ^5 + Tailwind CSS ^4 on Vercel; Supabase Postgres EU-Frankfurt; @supabase/supabase-js ^2.111.0; zod ^4.4.3 for Server Action input validation; `server-only` package to enforce server-only imports at build time (AD-1, AD-5).
- **Exactly one server write per quiz** via a single Server Action `lib/actions/submitQuizCompletion.ts` (`'use server'`), called through `useActionState` + `<form action>` — not an imperative fetch (AD-2, AD-5).
- **Score integrity**: Server Action receives raw answers (question id → selected option), recomputes score server-side from `lib/content`; never trusts a client-sent score. `completedAt` stamped server-side (AD-5).
- **Static quiz content lives in the repo**, not Supabase, this slice — versioned data files, accessed only through one content-accessor module `lib/content/index.ts` (`getQuestions()`, `getPreviewQuestion()`); no component imports the raw data file directly (AD-3, AD-6).
- **Quiz state in client memory only**: `useState`/`useReducer` inside the `components/quiz/` island; no per-question route segment (no `/quiz/[step]`), so a refresh cannot resurrect progress via URL (AD-7).
- **Design tokens wired as Tailwind theme** (`theme.extend`), not CSS variables — no `var(--token)` arbitrary-value usage for values already in the theme (AD-10).
- **Analytics through one wrapper**: all tracking calls go through `lib/analytics/track.ts` against a fixed event list in `lib/analytics/events.ts`; no component calls the Plausible/Umami SDK directly (AD-9).
- **Single Supabase project** (EU-Frankfurt) serves local dev, Vercel Preview, and production alike this slice — no dev/prod split (AD-11).
- **Supabase credentials never reach the browser**: RLS on the completions table denies all access except the server-side secret key (legacy `service_role` or newer `sb_secret_...` format — confirm actual format at provisioning, OQ-5); read only from server env, never `NEXT_PUBLIC_`-prefixed.
- **Data shapes fixed**: Server Action input `{ answers: { questionId: number, selectedOptionId: string }[], feedback?: number, email?: string }` (feedback coerced via `z.coerce.number()`); output `{ ok: true }` or `{ ok: false, error: string }` (never throws for expected validation failures); stored record `{ score: number, feedback?: 1|2|3|4|5, email?: string, completedAt: ISO 8601 string }`. Supabase table `quiz_completions`, snake_case columns, mapped from camelCase only inside `lib/supabase/`.
- **Structural seed / directory layout**: `app/` (layout, page, globals.css), `components/{landing,quiz,feedback,ui}/`, `lib/{content,actions,supabase,analytics}/`, `public/` — per ARCHITECTURE-SPINE Structural Seed.
- **Deployment**: single Vercel project, platform-default preview-per-PR and production-on-`main`, no custom CI/CD pipeline this slice.
- **Deferred / explicitly not built this slice** (tracked, not story-worthy now): error monitoring/observability tool, rate-limiting/spam protection on the Server Action, ESLint import-restriction rule for AD-6/AD-9/AD-10 enforcement (code review is the gate instead), ESLint ADR-specific tooling, ADR for moving content to Supabase later.

### UX Design Requirements

UX-DR1: Design tokens — palette (OKLCH/hex: primary aquamarine, primary-dark petroleum, accent-gold, correct/correct-bg, surface-base/raised/muted/muted-line, qtag-bg, mnemo-bg, text-primary/secondary, border-neutral, footer-bg/text), typography scale (Lexend for headlines/CTA/numbers/questions, Inter for body/options/tags, with `-mobile` variants for responsive steps), spacing scale (4px base unit, tokens 1-10 plus margin-mobile/margin-desktop), and two radii (`sm` 10px, `md` 20px, `full` 100px pill) must be registered under Tailwind v4 `theme.extend` (AD-10).

UX-DR2: `button-primary` component — pill radius, petroleum fill, white text, ink snap shadow; full variant (hero/quiz, carries `→` arrow) and compact variant (sticky header, no arrow, shorter shadow throw). Doubles as the in-quiz "Conferma" button.

UX-DR3: `category-tag` component — pill, aquamarine-tinted background, petroleum text/border, uppercase. Reused identically on hero eyebrow, real quiz card ("Domanda N di 10" progress label included), and static preview card (never carries the progress label there).

UX-DR4: `quiz-card` component — white, 3px ink border, 20px radius, 7px ink snap shadow. One component reused for the real quiz (FR-5), the static landing preview (FR-4), and the "Con Deer" comparison column — never re-implemented per surface.

UX-DR5: `answer-option` / `answer-option-correct` components — full-width, stacked, left-aligned. Default: white, thin neutral border, no shadow. Correct state (applied regardless of user's tap): green tint background, green border, green snap shadow, bold text + implicit non-color marker per NFR-1. No separate "wrong, your pick" style in v1.

UX-DR6: `mnemo-box` component — gold-tinted background, gold border, tagged "🔑 Mnemotecnica" in small-caps mnemo-tag style. Appears instantly (no transition/animation) below options after tap in the real quiz; shown pre-revealed as static illustration on the landing hero preview and the comparison "Con Deer" column.

UX-DR7: `floating-badge` component — small rotated gold pill anchored to a card corner, decorative/illustrative use only on the landing (e.g. static "Domanda 4/10" preview badge) — distinct from the real in-quiz progress indicator, which uses the plain `category-tag` style.

UX-DR8: `comparison-traditional` / `comparison-deer` components — traditional column deliberately underdesigned (muted flat background, skeleton placeholder lines, 85% opacity); Deer column is a full `quiz-card`. The visual-weight contrast between the two columns is the rhetorical argument (FR-2).

UX-DR9: `footer` component — full-bleed ink band, warm off-white text, no border/shadow.

UX-DR10: `logo-mark` component — 26px aquamarine circle placeholder, ink border, two small rotated "ear" shapes, always paired with the wordmark type role, never standalone (OQ-2 pending final logo).

UX-DR11: `chip` component — pill, 2px ink border, 3px ink snap shadow, rotated -4deg to 4deg alternating per chip (used where sticker-style badges/chips appear).

UX-DR12: Elevation system — no blur ever; flat hard-edged offset shadows in ink (`Npx Npx 0 ink`), heavier on larger surfaces (quiz card 7px) lighter on small (chip 3px, compact CTA 4px). Correct-answer state is the one place shadow color changes (to the correct-green token).

UX-DR13: Accessibility floor (behavioral) — correct-answer state never color-only (✓ + bold weight always accompany green border/background, NFR-1); WCAG 2.1 AA contrast verified specifically for `text-secondary` on `surface-muted`; all interactive elements (CTA, answer options, Conferma, star rating, email field, consent checkbox, footer links) keyboard-reachable and operable with a visible custom focus state (not default browser outline); star rating exposes current value and each star's role to assistive tech; tap targets ≥44×44px.

UX-DR14: Responsive layout rules — mobile (390px): single column, hero stack order logo→headline→subheadline→CTA→microcopy→trust-bar→preview→comparison→footer. Desktop (1280px): hero becomes two-column grid (copy left, live preview quiz-card right); comparison becomes two side-by-side columns; header keeps compact CTA visible via `position: sticky`. Quiz itself has no distinct desktop layout — always a single centered card on both breakpoints.

UX-DR15: Interaction primitives — tap/click only to select an answer (no drag/swipe); explicit tap on "Conferma" to advance (no auto-advance, no swipe, no keyboard shortcut beyond standard Tab/Enter); landing preview card is fully inert (tapping does nothing); sticky header CTA behaves identically to hero CTA.

UX-DR16: State patterns — mid-quiz refresh/tab close returns to question 1, nothing persisted (FR-7); answer tap causes instant snap-in of correct state + mnemo box (no animation/fade/slide); quiz-completion write failure (network drop) keeps score/recap visible (computed client-side) with a small inline non-blocking error + retry control near feedback/email area only; invalid email format shows inline validation without blocking feedback submission or screen viewing; email filled + consent unchecked on submit withholds only the email from the completion event (feedback and completion event still go through); star rating defaults to all-unfilled.

UX-DR17: Banned patterns for this slice (explicitly out of scope, present in full-product design system PDF but rejected here) — countdown/session timer, "Salta" (skip) control, auto-advance, streak/badge display, login gate, cross-session progress resume.

UX-DR18: Voice/tone microcopy rules — exact copy strings for hero, CTA, microcopy, comparison section titles/columns, footer text (see PRD §4 and EXPERIENCE.md Voice and Tone do/don't table); direct second-person tone, no exclamation-heavy hype or gamified encouragement.

### FR Coverage Map

| Requirement | Epic.Story |
| --- | --- |
| FR-1 | 1.2 |
| FR-2 | 1.3 |
| FR-3 | 1.4 |
| FR-4 | 1.5 |
| FR-5 | 2.2 |
| FR-6 | 2.3 |
| FR-7 | 2.2, 2.3 |
| FR-8 | 2.4 |
| FR-9 | 3.2 |
| FR-10 | 3.3 |
| FR-11 | 3.4 |
| FR-12 | 1.2, 2.2, 3.4 (event wiring per surface) |
| NFR-1 | 2.3, 3.2 |
| NFR-2 | 1.1 (Server-first foundation), all UI stories |
| NFR-3 | 3.4 |
| UX-DR1 (design tokens) | 1.1 |
| UX-DR2-UX-DR12 (component library) | 1.1, and consumed across all UI stories |
| UX-DR13 (accessibility floor) | 2.3, 3.2, 3.3 |
| UX-DR14 (responsive) | 1.2, 1.3, 1.5 |
| UX-DR15 (interaction primitives) | 1.5, 2.2, 2.3 |
| UX-DR16 (state patterns) | 2.2, 3.4 |
| UX-DR17 (banned patterns) | applies as constraint across Epic 2 |
| UX-DR18 (voice/tone/copy) | 1.2, 1.3, 1.4 |

## Epic List

1. **Epic 1: Landing Page & Foundation** — Project scaffold, design system wired into Tailwind, and the public landing page (hero, comparison, footer, quiz preview) that hooks a cold visitor and gets them to the quiz.
2. **Epic 2: Quiz di Assaggio** — The 10-question, no-login taste-quiz flow: single-question presentation, answer reveal with mnemonic unlock, client-only progress, and the results screen with score + mnemonic recap.
3. **Epic 3: Feedback, Email Capture & Completion Event** — Final-screen feedback box and optional email capture, the single server-side completion write (score integrity, EU data residency), and cookieless analytics wiring across the funnel.

<!-- Epics and stories to be detailed in step-02-design-epics.md -->
