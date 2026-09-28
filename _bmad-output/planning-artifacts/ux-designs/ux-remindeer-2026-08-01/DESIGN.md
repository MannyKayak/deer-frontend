---
status: final
updated: 2026-08-01
sources:
  - _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md
  - _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/addendum.md
name: Remindeer
description: Direct, no-fluff exam-prep brand for pharmacy-licensing candidates. Sticker-outline visual language — bold ink borders, flat "snap" shadows, generous radii — built to make a mnemonic feel like a small reward, not a study aid.
colors:
  primary: '#24C5AB'
  primary-dark: '#006670'
  on-primary: '#221812'
  accent-gold: '#E0AF3B'
  correct: '#43A84C'
  correct-bg: '#D0F3D0'
  error: '#E54151'
  surface-base: '#FAF5E6'
  surface-raised: '#FFFFFF'
  surface-muted: '#EAE8E0'
  surface-muted-line: '#DAD7D0'
  qtag-bg: '#C3E7DE'
  mnemo-bg: '#F4EAD5'
  text-primary: '#221812'
  text-secondary: '#5F5651'
  border-neutral: '#E7DBD5'
  footer-bg: '#221812'
  footer-text: '#D3CDBF'
typography:
  wordmark:
    fontFamily: Fredoka
    fontSize: 20px
    fontWeight: '600'
  headline-hero:
    fontFamily: Fredoka
    fontSize: 52px
    fontWeight: '700'
    lineHeight: '1.12'
  headline-hero-mobile:
    fontFamily: Fredoka
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.15'
  headline-section:
    fontFamily: Fredoka
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-section-mobile:
    fontFamily: Fredoka
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
  cta:
    fontFamily: Fredoka
    fontSize: 17px
    fontWeight: '600'
  cta-compact:
    fontFamily: Fredoka
    fontSize: 14px
    fontWeight: '600'
  stat-number:
    fontFamily: Fredoka
    fontSize: 26px
    fontWeight: '700'
  stat-number-mobile:
    fontFamily: Fredoka
    fontSize: 20px
    fontWeight: '700'
  question:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-mobile:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  option:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: '1.4'
  option-correct:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '700'
    lineHeight: '1.4'
  mnemo-tag:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    letterSpacing: 0.03em
  mnemo-body:
    fontFamily: Inter
    fontSize: 13.5px
    fontWeight: '500'
    lineHeight: '1.5'
  eyebrow:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    letterSpacing: 0.03em
  meta:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: '500'
  micro:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
rounded:
  sm: 10px
  md: 20px
  full: 100px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 22px
  '6': 28px
  '7': 44px
  '8': 56px
  '9': 64px
  '10': 80px
  margin-mobile: 22px
  margin-desktop: 56px
components:
  button-primary:
    background: '{colors.primary}'
    text: '{colors.on-primary}'
    font: '{typography.cta}'
    radius: '{rounded.md}'
    borderWidth: 2px
    borderColor: '{colors.text-primary}'
    shadow: '5px 5px 0 {colors.text-primary}'
    shadowCompact: '4px 4px 0 {colors.text-primary}'
    paddingHero: '18px 30px'
    paddingCompact: '12px 22px'
  chip:
    background: '{colors.surface-raised}'
    text: '{colors.text-primary}'
    font: '{typography.micro}'
    borderWidth: 2px
    borderColor: '{colors.text-primary}'
    radius: '{rounded.full}'
    shadow: '3px 3px 0 {colors.text-primary}'
    rotate: '-4deg to 4deg (alternate per chip)'
  quiz-card:
    background: '{colors.surface-raised}'
    borderWidth: 3px
    borderColor: '{colors.text-primary}'
    radius: '{rounded.md}'
    shadow: '7px 7px 0 {colors.text-primary}'
    padding: '{spacing.5}'
  category-tag:
    background: '{colors.qtag-bg}'
    text: '{colors.primary-dark}'
    font: '{typography.eyebrow}'
    borderWidth: 2px
    borderColor: '{colors.primary-dark}'
    radius: '{rounded.full}'
    textTransform: uppercase
  answer-option:
    background: '{colors.surface-raised}'
    text: '{colors.text-primary}'
    font: '{typography.option}'
    borderWidth: 2px
    borderColor: '{colors.border-neutral}'
    radius: '{rounded.sm}'
    padding: '13px 14px'
  answer-option-selected:
    background: '{colors.primary}/10'
    text: '{colors.text-primary}'
    font: '{typography.option-correct}'
    borderColor: '{colors.primary}'
    radius: '{rounded.sm}'
  answer-option-correct:
    background: '{colors.correct-bg}'
    text: '{colors.text-primary}'
    font: '{typography.option-correct}'
    borderColor: '{colors.correct}'
    radius: '{rounded.sm}'
    shadow: '5px 5px 0 {colors.correct}'
  answer-option-incorrect:
    background: '{colors.error}/10'
    text: '{colors.text-primary}'
    font: '{typography.option-correct}'
    borderColor: '{colors.error}'
    radius: '{rounded.sm}'
    shadow: '5px 5px 0 {colors.error}'
  mnemo-box:
    background: '{colors.mnemo-bg}'
    borderWidth: 2px
    borderColor: '{colors.accent-gold}'
    radius: '{rounded.sm}'
    padding: '{spacing.4}'
  floating-badge:
    background: '{colors.accent-gold}'
    text: '{colors.text-primary}'
    font: '{typography.cta}'
    borderWidth: 2px
    borderColor: '{colors.text-primary}'
    radius: '{rounded.full}'
    shadow: '4px 4px 0 {colors.text-primary}'
    rotate: 4deg
  logo-mark:
    size: 26px
    shape: circle
    background: '{colors.primary}'
    borderWidth: 2px
    borderColor: '{colors.text-primary}'
  comparison-traditional:
    background: '{colors.surface-muted}'
    text: '{colors.text-secondary}'
    borderWidth: 2px
    borderColor: '{colors.border-neutral}'
    radius: '{rounded.md}'
    opacity: 0.85
  comparison-remindeer:
    inherits: quiz-card
  footer:
    background: '{colors.footer-bg}'
    text: '{colors.footer-text}'
    font: '{typography.micro}'
---

## Brand & Style

Remindeer talks like a friend who's already passed the exam, not like a study coach. The visual system backs that up: sticker-outline shapes with bold ink-dark borders, flat "snap" shadows (offset, zero blur — nothing soft or glassy), and generous rounding everywhere except the smallest tags. It reads as playful-but-competent — closer to a well-made board game than a school app. Every surface repeats the same rhetorical move as the copy: a muted, deliberately flat "before" next to a bold, bordered, shadowed "after."

## Colors

- **Aquamarine (`{colors.primary}`)** is the brand color — logo mark, category tags, stat numbers. Energetic without being loud.
- **Petroleum (`{colors.primary-dark}`)** was the actionable color for `button-primary` until 2026-09-27; superseded by aquamarine + ink border (see Components) for closer alignment with the sticker-outline border language. Still used elsewhere (category-tag text/border).
- **Gold (`{colors.accent-gold}`)** is reserved for the mnemonic moment — the mnemo box border and the floating "Domanda N/10" badge. It marks "the thing you came here for," never used for CTAs or navigation.
- **Correct (`{colors.correct}`)** marks the right answer on every attempt, paired with its own tint background (`{colors.correct-bg}`) and a matching-color snap shadow. Never used decoratively.
- **Error (`{colors.error}`)** is reserved — this v1 slice has no wrong-answer-only state (the correct answer always highlights regardless of tap), but the token exists for future incorrect-state UI in the full product.
- **Surface base (`{colors.surface-base}`)** is the page canvas, a warm off-white — never pure white, so raised white cards (`{colors.surface-raised}`) read as distinct layers without needing shadows to separate them.
- **Surface muted (`{colors.surface-muted}` / `{colors.surface-muted-line}`)** is used exclusively for the "traditional method" side of the comparison — deliberately flatter, lower-contrast, borderless-feeling, to visually undersell it against the Remindeer column.
- **Ink (`{colors.text-primary}`)** is both the primary text color and the universal border/shadow color — the sticker-outline look comes from nearly everything bordering in this one near-black, not from per-component border colors.
- **Footer band (`{colors.footer-bg}` / `{colors.footer-text}`)** inverts to full ink with warm off-white text — the one dark surface in an otherwise light system, closing the page like a stamp.

Avoid: gradients, blurred/soft shadows, any color-only correct/incorrect signal (NFR-1 — pair with icon or text always).

## Typography

**Revised 2026-09-27**: Fredoka carries every moment that should feel like a headline or a number worth noticing: page titles, the CTA, stat numbers, the wordmark. Inter carries everything meant to be read at speed — body copy, question text, answer options, mnemonic text, tags, meta labels — it's the workhorse for the eventual 3000-question backlog, so legibility at small sizes matters more than personality. (Question text was briefly set to Lexend; corrected back to Inter to match `project-context.md` and the source design-system PDF, which was never revised to say otherwise.)

Two responsive steps only (390px mobile / 1280px desktop reference, per NFR-2) — most type roles ship a `-mobile` variant sized down, not restructured. Category tags, mnemonic tags, and comparison-column labels are always uppercase with `0.03em` tracking; nothing else is.

## Layout & Spacing

Base unit 4px. Section rhythm is wide on desktop (`{spacing.9}`–`{spacing.10}`, 64–80px, between hero/comparison/footer) and compresses hard on mobile (`{spacing.4}`–`{spacing.6}`, 16–28px) — the desktop page has room to breathe, the mobile page is a stack. Page margins: `{spacing.margin-mobile}` (22px) on mobile, `{spacing.margin-desktop}` (56px) on desktop, matching the 390/1280 reference breakpoints.

The comparison section is the one layout that structurally changes at the breakpoint (FR-2): single column stacked on mobile, two columns side-by-side from desktop up. Everything else reflows in place.

## Elevation & Depth

No blur, ever. Depth comes entirely from flat, hard-edged offset shadows in ink (`Npx Npx 0 {colors.text-primary}`) — heavier on bigger surfaces (quiz card: 7px), lighter on small ones (chip: 3px, compact CTA: 4px). The correct-answer state is the one place shadow color changes (to `{colors.correct}`) — a shadow-color swap is part of how "correct" reads as correct, alongside the border and background tint.

## Shapes

Two radii only, deliberately: `{rounded.sm}` (10px) for anything a user reads or taps inside a card — answer options, the mnemo box — and `{rounded.md}` (20px) for containers themselves — the quiz card, the comparison boxes. `{rounded.full}` (100px pill) is reserved for standalone actionable/badge shapes floating free of a container: the CTA button, chips, the floating "Domanda N/10" badge. Nothing in between; no sharp corners anywhere.

## Components

- **Button — primary (`button-primary`)** — the only button style in this slice (also doubles as the in-quiz "Avanti" advance button, see Story 2.2-REV). **Revised 2026-09-27**: aquamarine fill (`{colors.primary}`, `#24C5AB`), 20px radius (`{rounded.md}`, no longer full pill), 2px ink border added, ink text (`{colors.on-primary}` = `#221812`, ≈8:1 — white on aquamarine failed WCAG AA at ≈2.2:1, changed in code review 2026-09-27), ink snap shadow — closes the one inconsistency where the primary CTA was the only bordered-less sticker-outline surface in the system. Compact variant (smaller padding, shorter shadow throw) used in the sticky header, arrow-less; full variant in the hero and quiz carries the `→` arrow.
- **Category tag (`category-tag`)** — pill, aquamarine-tinted background, petroleum text and border, uppercase. Appears on the hero eyebrow, the quiz card, and the static preview card — same component everywhere.
- **Quiz card (`quiz-card`)** — the one card the whole product revolves around: white, 3px ink border, 20px radius, heaviest shadow in the system (7px). Used identically for the real quiz (FR-5), the static landing preview (FR-4), and the "Con Remindeer" comparison column — repetition is intentional, it's the same object doing different jobs.
- **Answer option (`answer-option` / `answer-option-selected` / `answer-option-correct` / `answer-option-incorrect`)** — full-width, stacked vertical, left-aligned text. Default state: white, thin neutral border, no shadow — deliberately quiet until an answer lands. **Revised 2026-08-02** (supersedes the original FR-6 reading below): tapping an option only sets `answer-option-selected` (primary-color border, low-opacity primary background) — no correctness shown yet, and the pick is changeable. Only on "Conferma" does the *selected* option flip to `answer-option-correct` (green tint/border/snap shadow, bold, ✓) or `answer-option-incorrect` (error-color tint/border/snap shadow, bold, ✗); the unselected correct option is never separately highlighted, so a wrong pick reads as genuinely wrong instead of the UI showing the answer regardless of what was tapped.
- **Mnemo box (`mnemo-box`)** — gold-tinted, gold-bordered, appears below the options after the tap (instant, no transition — see EXPERIENCE.md Interaction Primitives). Tagged `🔑 Mnemotecnica` in the small caps mnemo-tag style.
- **Floating badge (`floating-badge`)** — small rotated gold pill anchored to a card corner (e.g. the landing hero's static "Domanda 4/10" preview). Decorative/illustrative use on the landing only — the real in-quiz progress indicator is the plain `category-tag`-style "Domanda N di 10" pill, not the rotated floating badge.
- **Comparison columns (`comparison-traditional` / `comparison-remindeer`)** — the rhetorical core of the landing (FR-2). Traditional column deliberately underdesigned: muted flat background, skeleton placeholder lines standing in for "a wall of identical questions," 85% opacity. Remindeer column is a full `quiz-card`, bordered and shadowed — the contrast in visual weight between the two columns *is* the argument.
- **Footer (`footer`)** — full-bleed ink band, warm off-white text, no border/shadow (it's the page's base plane, not a floating element).
- **Logo mark (`logo-mark`)** — placeholder until final logo ships (OQ-2): 26px aquamarine circle, ink border, two small rotated "ear" shapes. Always paired with the `wordmark` type role, never standalone in this slice.

→ Composed reference: `mockups/key-landing-mobile.html`, `mockups/key-landing-desktop.html`, `mockups/key-quiz-question.html`, `mockups/key-final-screen.html`. Spine wins on conflict.

## Do's and Don'ts

| Do | Don't |
|---|---|
| One ink color for all borders and shadows | Per-component border/shadow colors (breaks the sticker-outline unity) |
| Flat, hard-edged offset shadows, zero blur | Soft/glass shadows, gradients |
| Pair correct/incorrect state with icon or text, never color alone | Rely on green/red alone for state (NFR-1) |
| Reuse the exact `quiz-card` component everywhere a question-style card appears | Invent a new card style per surface |
| Two radii only (10px inside cards, 20px for containers), full-pill for free-floating actions | Mix arbitrary corner radii |
| Keep the traditional-method column visibly flatter/quieter than the Remindeer column | Let the "before" side compete visually with the "after" side |
