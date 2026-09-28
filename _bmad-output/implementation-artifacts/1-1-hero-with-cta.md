---
baseline_commit: 0a49ef9dfd007bcae962695d9b716fe7bb97341e
supersedes: Story 1.1 as implemented in commit 0a49ef9 (was Status: done)
change_trigger: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md
---

# Story 1.1: Hero with CTA (Revised — token & typography update)

Status: done

> **Revision 2026-09-28** — trigger: `specs/spec-remindeer/SPEC.md` (update 2026-09-28: quiz content from shared Supabase, landing = reads + mailing list only).
>
> CTAs now link to `/quiz` and read "Prova il quiz gratis" (was "Prova 10 domande gratis") — question count is dynamic, so no number appears in CTA copy.

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to see a branded hero with a clear call to action,
so that I can understand what Remindeer offers and start the quiz in one tap.

## Acceptance Criteria

1. **Given** the project is scaffolded with Next.js App Router, TypeScript, Tailwind CSS v4, and the design tokens from `DESIGN.md` registered under `@theme` **When** a visitor loads the landing page **Then** the hero section renders eyebrow "Concorso pubblico farmacie", headline "La strada più veloce per vincere la farmacia.", subheadline "3000 domande ufficiali. Le ricordi con la mnemotecnica, non le rileggi all'infinito.", primary CTA "Prova 10 domande gratis" (with `→` arrow), microcopy "Nessuna registrazione richiesta", and a trust bar with 3 stats ("3000 domande ufficiali", "2 min per il quiz gratuito", "0 login richiesti").
2. **And** the hero is text-only, single-column, centered on both mobile and desktop — no product image or live quiz-card preview (confirms the existing implementation already has no image; this AC exists to make sure no such element is (re)introduced while other stories change around it).
3. **And** the header is sticky through scroll with a compact CTA (no arrow) always reachable.
4. **And** clicking either CTA (hero or header) lands the visitor directly on question 1/10 with no intermediate form or confirmation step. The CTA target is `href="#quiz"` today because the quiz is mounted inline on `app/page.tsx` (see Dev Note: current CTA wiring — do not change this in this story, Story 2.1 owns the `/quiz` route move).
5. **And** the hero and header render correctly at both the 390px mobile and 1280px desktop reference breakpoints per UX-DR14.
6. **And** `lib/analytics/track.ts` and `lib/analytics/events.ts` continue to exist with a fixed event list including `visit_landing`, and `visit_landing` still fires once when the landing page loads (no change expected here — verify it still works after the edits below).
7. **And** `button-primary` uses the revised token set (UX-DR2, `DESIGN.md` 2026-09-27 revision): `background: {colors.primary}` (`#24C5AB`, was `{colors.primary-dark}`), `radius: {rounded.md}` (20px, was `{rounded.full}` pill), plus a new `2px` solid border in `{colors.text-primary}` (was borderless).
8. **And** headline, CTA label, and stat-number text render in **Fredoka** (was Lexend) — `DESIGN.md` typography tokens `headline-hero(-mobile)`, `cta`/`cta-compact`, `stat-number(-mobile)`, `wordmark` all changed family 2026-09-27. Subheadline, microcopy, eyebrow, and trust-bar labels stay Inter (`font-sans`) — unchanged.
9. **And** `button-primary`, `category-tag`, and `logo-mark` remain implemented as reusable components per `DESIGN.md` and used here, not one-off markup (no regression on this from the original story).

## Tasks / Subtasks

- [x] Task 1: Add the Fredoka font and wire it into the theme (AC: #8)
  - [x] Add `Fredoka` via `next/font/google` in `app/layout.tsx` alongside the existing `Lexend`/`Inter` imports — expose as a new CSS variable, e.g. `variable: "--font-fredoka-raw"` (keep `Lexend`/`Inter` imports in place; `Lexend` may become unused by the hero/header but do not remove it from `layout.tsx` yet — other components/stories may still reference `font-lexend` until a full audit; flag any now-orphaned `font-lexend` usage you find, don't silently leave dead code without a note)
  - [x] Register `--font-fredoka: var(--font-fredoka-raw);` in the `@theme inline` block in `app/globals.css`, next to the existing `--font-sans`/`--font-lexend` entries
- [x] Task 2: Update `button-primary.tsx` token set (AC: #7)
  - [x] Change `bg-primary-dark` → `bg-primary`
  - [x] Change `rounded-full` → `rounded-md`
  - [x] Add `border-2 border-text-primary` (both variants — full and compact)
  - [x] Verify the JSDoc comment above the component (mentions "petroleum fill") is updated to match the new spec, so it doesn't mislead the next reader
- [x] Task 3: Update `hero.tsx` typography (AC: #1, #2, #8)
  - [x] Headline (`h1`): `font-lexend` → `font-fredoka`
  - [x] Stat-number spans (`TRUST_STATS` values): `font-lexend` → `font-fredoka`
  - [x] Leave subheadline (`p`), microcopy (`span`), and trust-bar labels on `font-sans` (Inter) — unchanged
  - [x] Confirm no image/preview markup exists in this file (it currently doesn't — this is a verification subtask, not expected to require a code change)
- [x] Task 4: Update `header.tsx` / CTA label typography where it flows through `ButtonPrimary`'s `cta`/`cta-compact` font role (AC: #8)
  - [x] `ButtonPrimary`'s own class list currently hardcodes `font-lexend` for its label text — change to `font-fredoka` inside `button-primary.tsx` (this covers both the Hero's full CTA and the Header's compact CTA in one place, since they share the component)
  - [x] No change needed to `header.tsx` itself — it only consumes `ButtonPrimary`
- [x] Task 5: Manual verification (AC: #1–#9)
  - [x] Rebuild (`npm run build`) and confirm compiled CSS contains `.bg-primary`, `.rounded-md`, `.border-text-primary`, `.font-fredoka` utility classes actually generated (same verification method as the original Story 1.1 completion notes — don't skip this, it's how the token-registration approach gets caught if silently dropped)
  - [x] Visually/textually re-verify all original AC copy strings and breakpoint behavior are unaffected by this token-only pass (nothing in this revision changes copy, layout structure, or breakpoints — only color/radius/border/font-family)

### Review Findings

- [x] [Review][Decision] CTA label contrast fails WCAG AA — RESOLVED 2026-09-27: option 1 (ink text on aquamarine) — white `text-on-primary` (#FFFFFF) on `bg-primary` (#24C5AB) ≈ 2.2:1, below 4.5:1 (normal) and 3:1 (large). Code matches DESIGN.md exactly; spec itself is the problem. Affects hero CTA, header CTA, and in-quiz/results buttons (shared component). Options: ink text (`text-text-primary`, ≈8:1), revert fill to `primary-dark`, or accept as-is.
- [x] [Review][Patch] Switch CTA label to ink text: `on-primary` → #221812 (≈8:1) in globals.css + DESIGN.md token [app/globals.css:12]
- [x] [Review][Patch] Wordmark font size 18px (`text-lg`) vs DESIGN.md `wordmark.fontSize: 20px` [components/landing/header.tsx:9]
- [x] [Review][Patch] Full CTA font size 16px (`text-base`) vs DESIGN.md `cta.fontSize: 17px` [components/ui/button-primary.tsx:34]
- [x] [Review][Patch] JSDoc names in-quiz labels "Avanti"/"Ritenta" but `quiz-flow.tsx:91` still renders "Conferma"/"Continua" — misleads next reader [components/ui/button-primary.tsx:25]
- [x] [Review][Patch] Brand rename "Deer" → "Remindeer" (header wordmark + `<title>`) not recorded in Completion Notes/Change Log despite Task 5 "no copy changes" [components/landing/header.tsx:10, app/layout.tsx:21]
- [x] [Review][Defer] Orphaned `font-lexend` usages in comparison-*, email-capture, results-screen, quiz-flow, quiz-preview; Lexend still loaded (3 font families); globals.css comment claims Inter for questions [app/globals.css:4] — deferred, pre-existing
- [x] [Review][Defer] `ButtonPrimary` has no `disabled:` styles — results-screen submit (`disabled={isPending}`) still looks/hover-lifts active [components/ui/button-primary.tsx:36] — deferred, pre-existing
- [x] [Review][Defer] Header may overflow/wrap below 390px (longer wordmark + compact CTA, no gap between groups) [components/landing/header.tsx:6] — deferred, pre-existing
- [x] [Review][Defer] `#quiz` anchor target lacks `scroll-margin-top`; sticky header may cover quiz top after jump [app/page.tsx] — deferred, pre-existing
- [x] [Review][Defer] Hover lift ignores `prefers-reduced-motion` (no `motion-reduce:` variants) [components/ui/button-primary.tsx:36] — deferred, pre-existing
- [x] [Review][Defer] Planning doc drift: DESIGN.md prose (~l.270) still reserves `rounded.full` for CTA; epics.md (~l.160) still says `theme.extend` — deferred, pre-existing

## Dev Notes

### What actually exists today (read this before touching anything)

This story was previously implemented and marked `done` (see `baseline_commit` in this file's front-matter, commit `0a49ef9`). The PO then requested a design-token/typography change (`sprint-change-proposal-2026-09-27.md`) — **this is not a from-scratch build**, it's a targeted revision of working code. Do not re-scaffold anything Task-1-of-the-original-story already built.

Current state of every file this story touches, read in full before editing:

- **`components/landing/hero.tsx`** — already text-only, single-column, no image. Uses `font-lexend` on the `h1` and on each `TRUST_STATS` value span. Subheadline/microcopy already `font-sans` (Inter) — leave those alone.
- **`components/ui/button-primary.tsx`** — `sharedClasses` string hardcodes `rounded-full bg-primary-dark ... font-lexend`, no border at all today. Both the `full` and `compact` size variants share this one class string — editing it once fixes Hero's CTA, Header's compact CTA, and (later, other stories) the in-quiz "Avanti"/"Ritenta" buttons, since they all render through this same component.
- **`components/landing/header.tsx`** — only consumes `ButtonPrimary`, no direct styling of its own to change.
- **`app/globals.css`** — `@theme inline` block already defines `--color-primary: #24c5ab` (this is the exact hex the PO asked for — no new color token needed, just re-point the button to the token that already exists) and `--color-text-primary: #221812` (use this for the new border, not a hardcoded hex). `--radius-md: 20px` already exists too. Only a new `--font-fredoka` variable is actually new.
- **`app/layout.tsx`** — loads `Lexend` and `Inter` via `next/font/google`, exposes `--font-lexend-raw`/`--font-inter-raw`. No `Fredoka` import exists yet.
- **`app/page.tsx`** — currently renders `Hero`, `QuizPreview`, an inline `<section id="quiz">` wrapping `QuizFlow`, and `ComparisonSection` all on one page. **Do not touch `app/page.tsx`, `QuizPreview`, or `QuizFlow` in this story** — `QuizPreview`'s removal is Story 1.4 (retired, code-removal-only), the `/quiz` route extraction is Story 2.1-REV. This story is scoped strictly to Hero/Header visual tokens.

### Dev Note: current CTA wiring — do not "fix" it here

The CTA currently points at `href="#quiz"`, matching an in-page anchor because the quiz is still mounted inline on the landing page (see `app/page.tsx` above). The epics.md AC language ("lands on question 1/10", "own /quiz route") describes the **target end state after Story 2.1-REV lands**, not this story's scope. Leave `href="#quiz"` as-is here — changing it without Story 2.1-REV's route existing would break the CTA. This is an intentional sequencing note, not an oversight in the AC wording above.

### Architecture compliance (must still hold)

- **AD-8 (Server Components by default):** `Hero`, `Header`, `ButtonPrimary` remain Server Components — this revision is CSS/markup-class changes only, introduces no interactivity, no `'use client'` needed anywhere touched here.
- **AD-10 (design tokens as theme):** new `--font-fredoka` token goes in `app/globals.css`'s existing `@theme inline` block, same mechanism as `--font-lexend`/`--font-sans` — do not create a `tailwind.config.js`.
- **AD-4 (components owned by DESIGN.md):** the exact new values are fixed in `DESIGN.md`'s `components.button-primary` and `typography.*` frontmatter (2026-09-27 revision) — copy those, don't eyeball new numbers.

### Font-family token map (exact, from `DESIGN.md` 2026-09-27 revision)

| Role | Old family | New family | Used in (this story's scope) |
|---|---|---|---|
| `headline-hero`/`-mobile` | Lexend | **Fredoka** | `hero.tsx` `h1` |
| `cta`/`cta-compact` | Lexend | **Fredoka** | `button-primary.tsx` label text (both variants) |
| `stat-number`/`-mobile` | Lexend | **Fredoka** | `hero.tsx` `TRUST_STATS` value spans |
| `wordmark` | Lexend | **Fredoka** | `header.tsx` "Remindeer" text span — in scope too, since it's the wordmark role even though `header.tsx` needed no other change |
| `body`, `eyebrow`, `option`, `question`, etc. | Inter | **Inter (unchanged)** | subheadline, microcopy, trust-bar labels, `CategoryTag` — do not touch |

Note the `wordmark` span in `header.tsx` (`<span className="font-lexend ...">Remindeer</span>`) also needs `font-lexend` → `font-fredoka` — this was missed from the Tasks list above by category (it's technically in `header.tsx`, not just flowing through `ButtonPrimary`); add it to Task 4.

### `button-primary.tsx` exact class diff

Old: `rounded-full bg-primary-dark font-lexend font-semibold text-on-primary`
New: `rounded-md bg-primary border-2 border-text-primary font-fredoka font-semibold text-on-primary`

Shadow (`shadow-[5px_5px_0_var(--color-text-primary)]` / compact `4px`) is unchanged — ink shadow color was already correct, only the fill/radius/border/font change.

### Testing standards

No test framework exists in this repo (confirmed again — still no Jest/Vitest/Playwright config since the original Story 1.1). Verify manually: rebuild, inspect compiled CSS for the new utility classes, and eyeball the rendered hero/header against `DESIGN.md`'s updated component spec. If a QA automation pass is wanted later, that's the separate `bmad-qa-generate-e2e-tests` skill, not this story.

### Project Structure Notes

- No new files, no new directories. Every change is an edit to an existing file: `app/layout.tsx`, `app/globals.css`, `components/ui/button-primary.tsx`, `components/landing/hero.tsx`, `components/landing/header.tsx`.
- `lib/data/` appears as an untracked directory in the current git status and `lib/data/quiz.ts` exists alongside `lib/content/questions.ts` — this looks like in-progress/parallel content work unrelated to this story; do not touch it, do not assume it's connected to Story 1.1's scope.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — canonical revised ACs (2026-09-27)
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-27.md] — why this changed, full impact analysis
- [Source: _bmad-output/planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md#FR-1] — original hero requirement + exact copy strings (unchanged by this revision)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md#Components, #Typography] — revised `button-primary` and typography token values (2026-09-27)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-remindeer-2026-08-01/EXPERIENCE.md#Responsive & Platform] — confirms hero is now text-only on both breakpoints
- [Source: components/landing/hero.tsx, components/ui/button-primary.tsx, components/landing/header.tsx, app/globals.css, app/layout.tsx] — actual current implementation read in full for this story (see Dev Notes above)
- [Source: _bmad-output/implementation-artifacts/1-1-hero-with-cta.md @ commit 0a49ef9] — original story's Dev Notes on Tailwind v4 `@theme` token registration and `next/font/google` usage pattern, still valid and not repeated here in full

## Latest Tech Information

- No new libraries introduced. `next/font/google`'s `Fredoka` export works identically to the already-used `Lexend`/`Inter` (same Google Fonts variable-font mechanism) — no version-specific concerns beyond what the original Story 1.1 already confirmed against the installed Next.js 16.2.12 docs.

## Change Log

- 2026-09-28: Revised for Supabase content + landing read/mailing-list-only permissions (see revision note at top).
- 2026-09-27: Story revised per `sprint-change-proposal-2026-09-27.md` — button-primary token set (aquamarine fill, 20px radius, ink border) and Fredoka typography for headline/CTA/stat-number/wordmark. Status reset to `ready-for-dev`.
- 2026-09-27: Implemented — Fredoka font + `--font-fredoka` theme token; `button-primary` → `bg-primary`/`rounded-md`/`border-2 border-text-primary`/`font-fredoka`; hero headline + stat numbers + header wordmark → Fredoka; hero content centered (AC #2). Status → `review`.
- 2026-09-27: Code review — CTA label → ink (`on-primary` #221812, WCAG AA fix; DESIGN.md token updated), wordmark 20px, full CTA 17px, JSDoc labels corrected. Brand rename "Deer" → "Remindeer" (header wordmark + `<title>`) recorded here: copy change applied alongside this story to match DESIGN.md `name: Remindeer`.

## Dev Agent Record

### Agent Model Used

Claude Opus 5.5 (claude-opus-5-5)

### Debug Log References

- `npm run build` — compiled OK, TypeScript OK, 4/4 static pages generated.
- `npx eslint app components` — no findings.
- Compiled CSS verified: `.bg-primary{background-color:#24c5ab}`, `.rounded-md{border-radius:20px}`, `.border-text-primary{border-color:#221812}`, `.border-2{…border-width:2px}`, `.font-fredoka{font-family:var(--font-fredoka-raw)}`, `.text-center`.
- Prerendered `index.html`: all AC #1 copy strings present, no `<img>` in hero, both CTAs `href="#quiz"`, `<html>` carries the Fredoka/Lexend/Inter variable classes.
- Visual check via Playwright on `next start` at 1280×800 and 390×844: header sticky with compact CTA, hero single-column centered, trust bar wraps to 2+1 on mobile. Screenshots discarded after check.

### Completion Notes List

- Task 1: `Fredoka` added via `next/font/google` (`--font-fredoka-raw`), registered as `--font-fredoka` in `@theme inline`. `Lexend` import kept as instructed.
- Task 2 + 4: `button-primary` class set changed exactly per Dev Notes diff (shadow untouched); JSDoc updated (no longer "pill"; in-quiz labels now "Avanti"/"Ritenta"). Covers hero CTA and header compact CTA.
- Task 3: hero `h1` + `TRUST_STATS` values → `font-fredoka`; Inter elements untouched; no image/preview markup present.
- Task 4 (Dev Notes addendum): header wordmark span → `font-fredoka`.
- **Deviation / AC #2:** Dev Notes said hero was already compliant, but it was left-aligned (`items-start`). AC #2 and EXPERIENCE.md require "centered" on both breakpoints, so the section, CTA block and trust bar were switched to `items-center`/`text-center`/`justify-center`. Layout structure, copy and breakpoints otherwise unchanged.
- No test framework in repo (per Dev Notes) — verification is build + compiled-CSS inspection + prerendered HTML + visual check. `visit_landing` wiring (`PageViewTracker` in `app/page.tsx`, event in `lib/analytics/events.ts`) untouched and intact (AC #6).
- **Flag — orphaned `font-lexend` usages** (out of scope, left as-is; DESIGN.md now maps these roles to Fredoka): `comparison-section.tsx` (h2), `comparison-remindeer.tsx` (h3, p), `comparison-traditional.tsx` (h3), `email-capture.tsx` (label), `results-screen.tsx` (2 spans), `quiz-flow.tsx` + `quiz-preview.tsx` (question text — should become Inter per 2026-09-27 `typography.question` fix). Suggest handling in Story 2.x / 1.4 removal or a small follow-up.
- **Flag — contrast:** `button-primary` spec (white `on-primary` text on `#24C5AB`) gives ≈2.2:1, below WCAG AA 4.5:1 (and 3:1 large-text). Implemented as specified; recommend UX decide on ink text (`text-primary`, ≈8:1) or keep `primary-dark` fill.  **Resolved in code review 2026-09-27: ink text chosen.**

### File List

- app/layout.tsx (modified)
- app/globals.css (modified)
- components/ui/button-primary.tsx (modified)
- components/landing/hero.tsx (modified)
- components/landing/header.tsx (modified)
- _bmad-output/implementation-artifacts/1-1-hero-with-cta.md (modified — status/tasks/record)
- _bmad-output/implementation-artifacts/sprint-status.yaml (modified — 1-1 → review)
