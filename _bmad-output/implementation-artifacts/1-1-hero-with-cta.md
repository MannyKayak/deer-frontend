---
baseline_commit: 8d45f62a85336228465f91048a9688ebc65b2f9d
---

# Story 1.1: Hero with CTA

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want to see a branded hero with a clear call to action,
so that I can understand what Deer offers and start the quiz in one tap.

## Acceptance Criteria

1. **Given** the project is scaffolded with Next.js App Router, TypeScript, Tailwind CSS v4, and the design tokens from DESIGN.md registered under `@theme` **When** a visitor loads the landing page **Then** the hero section renders eyebrow "Concorso pubblico farmacie", headline "La strada più veloce per vincere la farmacia.", subheadline "3000 domande ufficiali. Le ricordi con la mnemotecnica, non le rileggi all'infinito.", primary CTA "Prova 10 domande gratis" (with `→` arrow), microcopy "Nessuna registrazione richiesta", and a trust bar with 3 stats ("3000 domande ufficiali", "2 min per il quiz gratuito", "0 login richiesti").
2. **And** the header is sticky through scroll with a compact CTA (no arrow) always reachable.
3. **And** clicking either CTA (hero or header) is wired to the shared quiz entry point with no intermediate form or confirmation step — see **Dev Note: CTA target scope** below, since the quiz itself is built in Epic 2.
4. **And** the hero and header render correctly at both the 390px mobile and 1280px desktop reference breakpoints per UX-DR14.
5. **And** `lib/analytics/track.ts` and `lib/analytics/events.ts` exist with a fixed event list including `visit_landing`, and `visit_landing` fires once when the landing page loads.
6. **And** `button-primary`, `category-tag`, and `logo-mark` are implemented as reusable components per DESIGN.md (UX-DR2, UX-DR3, UX-DR10) and used here, not one-off markup.

## Tasks / Subtasks

- [x] Task 1: Wire design tokens into Tailwind v4 (AC: #1, #4, #6)
  - [x] Add Lexend + Inter via `next/font/google` in `app/layout.tsx`, replacing the default Geist fonts; expose as CSS variables (`--font-lexend`, `--font-inter`)
  - [x] Add DESIGN.md's color/radius/spacing tokens as CSS custom properties inside the `@theme` block in `app/globals.css` (see **Dev Note: Tailwind v4 token registration** — do not create a `tailwind.config.js` with `theme.extend`)
- [x] Task 2: Build shared UI primitives in `components/ui/` (AC: #6)
  - [x] `LogoMark` — 26px aquamarine circle, 2px ink border, two small rotated "ear" shapes (placeholder per OQ-2), always paired with the wordmark text, never standalone
  - [x] `ButtonPrimary` — full variant (hero/quiz, `→` arrow) and compact variant (sticky header, no arrow); pill radius, petroleum fill, white text, ink snap shadow (5px full / 4px compact); this component will later double as the in-quiz "Conferma" button (Epic 2) — keep it generic (label, variant, optional arrow, `href`/`onClick`), not hero-specific
  - [x] `CategoryTag` — pill, aquamarine-tinted background, petroleum text/border, uppercase; used here for the hero eyebrow; will be reused unchanged for the quiz card's "Domanda N di 10" label and the static preview card (Story 1.4, Epic 2) — keep prop-driven (just `children`/text), no eyebrow-specific hardcoding
- [x] Task 3: Build Hero + sticky header in `components/landing/` (AC: #1, #2, #3, #4)
  - [x] `Header` — logo + wordmark, compact `ButtonPrimary`, `position: sticky`
  - [x] `Hero` — eyebrow (`CategoryTag`), headline, subheadline, full `ButtonPrimary` with arrow, microcopy, trust bar (3 stats)
  - [x] Wire both CTAs to the shared quiz-entry target per **Dev Note: CTA target scope**
- [x] Task 4: Analytics wrapper (AC: #5)
  - [x] `lib/analytics/events.ts` — fixed event name list/type: `visit_landing`, `quiz_started`, `quiz_completed` (only `visit_landing` fires in this story; the other two are reserved for Epic 2/3 so the list is stable from the start, per AD-9)
  - [x] `lib/analytics/track.ts` — provider-agnostic `track(event, props?)` that safely no-ops if no analytics script is loaded yet (Plausible/Umami choice is OQ-4, unresolved)
  - [x] Fire `visit_landing` once on landing page load — see **Dev Note: firing a client event from a Server Component tree**
- [x] Task 5: Assemble `app/page.tsx` + `app/layout.tsx` (AC: #1, #2)
  - [x] Replace the create-next-app boilerplate content in both files entirely (current content is the unmodified `create-next-app` template — see Dev Notes)
  - [x] Update `metadata` (title/description) away from the "Create Next App" default
- [x] Task 6: Verify responsive behavior at 390px and 1280px breakpoints; spot-check text/background contrast against DESIGN.md's do/don't table (AC: #4)

## Dev Notes

### Architecture compliance (must follow)

- **AD-1 (stack fixed):** Next.js App Router + TypeScript + Tailwind CSS v4, deployed to Vercel. Do not introduce a different stack or a CSS-in-JS library.
- **AD-4 (components owned by DESIGN.md):** `button-primary`, `category-tag`, `logo-mark` visual specs (colors, radii, shadows, padding) are fixed in DESIGN.md's `components` frontmatter — copy the exact values, don't invent new ones. `quiz-card`, `answer-option`, `mnemo-box` etc. are out of scope for this story (Epic 2).
- **AD-8 (Server Components by default):** `app/page.tsx` and everything under `components/landing/` must stay Server Components — no `'use client'` in `Header`/`Hero`/`LogoMark`/`ButtonPrimary`/`CategoryTag`. See the analytics dev note below for the one place this needs care.
- **AD-9 (analytics through one wrapper):** all tracking goes through `lib/analytics/track.ts` against the fixed list in `lib/analytics/events.ts`. No component calls a Plausible/Umami SDK directly (OQ-4 isn't resolved yet, so there's nothing vendor-specific to call — `track()` should be a safe no-op or console-log stub for now).
- **AD-10 (design tokens as theme):** register tokens as theme values consumable via ordinary Tailwind utility classes — see the Tailwind v4 note below, the mechanism is CSS `@theme`, not a JS config.

### Dev Note: Tailwind v4 token registration (read before Task 1)

`ARCHITECTURE-SPINE.md` (AD-10) says tokens go "under `theme.extend`" — that phrasing is Tailwind v3's JS-config mental model. **This project has no `tailwind.config.js`/`.ts` file** (confirmed: repo root has none) and `app/globals.css` already uses Tailwind v4's CSS-first `@theme inline` block:

```css
@import "tailwindcss";
:root { --background: #ffffff; --foreground: #171717; }
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Follow this exact pattern for DESIGN.md's tokens — add `--color-*`, `--font-*`, `--radius-*`, `--spacing-*` custom properties inside `@theme`, e.g. `--color-primary: #24C5AB;`, `--color-primary-dark: #006670;`, `--radius-sm: 10px;`, `--radius-md: 20px;`. Tailwind v4 auto-generates utility classes from these (`bg-primary`, `text-primary-dark`, `rounded-sm`, `rounded-md`, etc.) — no separate config file needed. **Do not create a `tailwind.config.js` with `theme.extend`** — it won't match how this project is actually wired and will silently not apply.

Exact token values needed for this story (full palette in DESIGN.md if more are needed later):
`primary #24C5AB`, `primary-dark #006670`, `on-primary #FFFFFF`, `accent-gold #E0AF3B`, `surface-base #FAF5E6`, `surface-raised #FFFFFF`, `qtag-bg #C3E7DE`, `text-primary #221812`, `text-secondary #5F5651`, `border-neutral #E7DBD5`. Radii: `sm 10px`, `md 20px`, `full 100px`. `button-primary` shadow: `5px 5px 0 {text-primary}` (full) / `4px 4px 0 {text-primary}` (compact). `chip`/tag shadow pattern (flat, zero blur) applies to any bordered sticker-style element.

DESIGN.md's typography roles (`headline-hero`, `cta`, `eyebrow`, `stat-number`, etc.) are named **combinations** of family+size+weight+line-height, not a single Tailwind theme axis — there's no architecture decision on whether these become named `--text-*` theme keys or per-element utility composition. For this story, wire `--font-lexend`/`--font-inter` family tokens into `@theme` and compose the rest with ordinary Tailwind utilities (arbitrary values for the exact px sizes DESIGN.md specifies, e.g. `text-[52px]` for `headline-hero`) — don't invent a new named-role system unprompted.

Needed for this story from DESIGN.md's typography table: `headline-hero` (Lexend 700, 52px/1.12, `-mobile` 30px/1.15), `wordmark` (Lexend 600, 20px), `eyebrow` (Inter 600, 11px, `0.03em` tracking, uppercase), `cta` (Lexend 600, 17px) / `cta-compact` (Lexend 600, 14px), `stat-number` (Lexend 700, 26px, `-mobile` 20px), `body`/`body-mobile` (Inter 400, 18px/15px) for the subheadline/microcopy.

### Dev Note: CTA target scope (read before Task 3)

Epic 2 (the actual quiz) doesn't exist yet — this story only builds the landing. AC #3 in epics.md says the CTA "lands the visitor directly on question 1/10", but there's nothing to land on yet. **Structural Seed in ARCHITECTURE-SPINE.md shows a single `app/page.tsx`, no `/quiz` route** — combined with AD-7 ("no route segment encodes quiz step"), the quiz is not a separate Next.js page; it's a client island (`components/quiz/`) that Epic 2 will mount on the same page. **Do not create a `/quiz` route.** For this story: point both CTAs at a stable in-page anchor, e.g. `href="#quiz"` (or wire an `onClick` scroll-into-view), so Epic 2 can drop `<section id="quiz">` in without Story 1.1 needing rework. It's expected that this anchor resolves to nothing visible yet — that's correct for this story's scope, not a bug.

### Dev Note: firing a client event from a Server Component tree (read before Task 4)

There's a real tension between AD-8 ("`'use client'` appears only in `components/quiz/` and `components/feedback/`") and AD-9/FR-12 (landing must fire `visit_landing` on load) — firing any client-side event on mount inherently needs either a Client Component or a `<script>` tag, and AD-8's Structural Seed doesn't list an analytics client boundary. Two ways to resolve, pick one and stay consistent:

- **Recommended:** add one small, non-visual Client Component (e.g. `components/analytics/PageViewTracker.tsx`, `'use client'`, no UI, just a `useEffect` calling `track('visit_landing')` once) and mount it once in `app/page.tsx`. It's not "landing UI" in the sense AD-8 is guarding against (no interactive island competing for bundle size), just an event-firing hook — reasonable reading of AD-8's intent even though it's technically a `'use client'` file outside `components/quiz/`/`components/feedback/`.
- **Fallback (zero exceptions to AD-8):** use Next's built-in `next/script` component (usable directly from a Server Component, doesn't require `'use client'` on the parent) with an inline snippet calling a plain global tracking function.

If this feels like it should be an explicit architecture decision rather than a per-story call, flag it — this note is filling a real gap, not restating an existing rule.

### Minor copy/layout nuances (non-binding, don't over-engineer)

- Trust bar labels may abbreviate on mobile ("quiz gratis" instead of "per il quiz gratuito", "login" instead of "login richiesti") — a responsive typography variant per `addendum.md`, not a separate content requirement. Full desktop labels are always correct; mobile abbreviation is optional polish, not an AC.
- `addendum.md` mentions a mobile-only variant where the header's compact CTA is replaced by a small "Farmacie" chip. `EXPERIENCE.md` explicitly calls this "a layout detail only, not a distinct requirement." AC #2 (compact CTA always reachable) is the binding requirement — implement that; the chip variant is not required for this story.

### Project Structure Notes

- Repo is currently the unmodified `create-next-app` output (`app/page.tsx`, `app/layout.tsx`, `app/globals.css` all default boilerplate; `package.json` already pins `next@16.2.12`, `react@19.2.4`, `tailwindcss@^4` — matching ARCHITECTURE-SPINE.md's Stack table exactly, no version drift). This story replaces `page.tsx`/`layout.tsx`/`globals.css` content wholesale — expected, not a regression.
- No `components/`, `lib/`, or `public/` custom assets exist yet. Create `components/ui/`, `components/landing/`, `lib/analytics/` fresh, matching the Structural Seed in `ARCHITECTURE-SPINE.md`.
- Default `public/*.svg` files (`next.svg`, `vercel.svg`, etc.) and their references in the old `page.tsx` can be deleted once no longer imported — don't leave dead imports.
- No test framework is specified anywhere in the architecture or epics for this slice (Stack table lists no Jest/Vitest/Playwright). Verify this story manually against each AC and against the reference mockups (`mockups/key-landing-mobile.html`, `mockups/key-landing-desktop.html` — see References) rather than inventing a test framework unprompted. Automated E2E tests, if wanted later, go through the separate `bmad-qa-generate-e2e-tests` skill after implementation.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — canonical ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-deer-2026-08-01/prd.md#FR-1] — hero requirement + exact copy strings
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/DESIGN.md#Colors, #Typography, #Components] — token values, `button-primary`/`category-tag`/`logo-mark` specs
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/EXPERIENCE.md#Component Patterns, #Responsive & Platform] — CTA behavioral rules, breakpoint layout
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-deer-2026-08-01/mockups/key-landing-mobile.html] and [key-landing-desktop.html] — pixel-reference for visual QA
- [Source: _bmad-output/planning-artifacts/architecture/architecture-deer-2026-08-01/ARCHITECTURE-SPINE.md#AD-1, AD-4, AD-8, AD-9, AD-10, Structural Seed] — stack, component ownership, client/server boundary, analytics wrapper, token registration, directory layout
- [Source: node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md] — `next/font/google` usage pattern for Lexend/Inter (confirmed against the installed Next.js 16.2.12 docs, not training-data Next.js — per AGENTS.md)

## Latest Tech Information

- Installed versions (already in `package.json`, matches architecture exactly): `next@16.2.12`, `react@19.2.4`, `react-dom@19.2.4`, `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `typescript@^5`.
- `next/font/google` API (Next 16.2.12, confirmed against bundled docs): import the font function directly (`import { Lexend, Inter } from 'next/font/google'`), call with `subsets`/`weight` options, apply via `className` or expose as a CSS variable with `variable: '--font-lexend'` and reference it in `@theme`. Non-variable fonts require an explicit `weight` array/string (Lexend/Inter are variable fonts on Google Fonts, so `weight` is optional — omit it and let the variable font handle all needed weights).
- Next 16.2.12 also exposes global `PageProps`/`LayoutProps` type helpers (no import needed) if typing route props becomes relevant later — not needed for this static story.

## Change Log

- 2026-08-02: Implemented Story 1.1 — design tokens wired into Tailwind v4 `@theme`, `LogoMark`/`ButtonPrimary`/`CategoryTag` primitives, `Header`/`Hero` landing components, analytics wrapper + `PageViewTracker`, `app/page.tsx`/`app/layout.tsx` assembled. Fixed a breakpoint precision issue during implementation (see Completion Notes). Status → review.

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — clean compile, TypeScript pass, static page generated (run twice: once pre-breakpoint-fix, once after)
- `npx eslint app components lib` — 0 errors/warnings (full-repo `npm run lint` shows pre-existing errors/warnings in `_bmad-output/.../imports/support.js`, an unrelated UX-design import asset not touched by this story)
- Manual smoke test via `npm run dev` + `curl`: verified rendered HTML contains all required copy strings (headline, subheadline, microcopy, all 3 trust-bar stats), verified compiled CSS actually generated rules for the custom `@theme` tokens (`.bg-primary-dark`, `.font-lexend`, `.bg-qtag-bg`, `--radius-sm`), confirming the Tailwind v4 token-registration approach works end-to-end and isn't silently dropped.

### Completion Notes List

- All 6 ACs implemented and manually verified against rendered HTML + compiled CSS (no test framework exists in this repo yet, per the story's own Dev Notes — see Project Structure Notes). Could not verify the `visit_landing` console log or live browser rendering visually (no browser automation available this session); relied on server-rendered HTML output + code review instead. Flagging this explicitly rather than claiming full visual QA.
- Confirmed the two flagged Dev Note risks resolved as recommended: (1) tokens registered via CSS `@theme` in `globals.css`, not a `tailwind.config.js` — verified the generated utility classes exist in compiled CSS; (2) added `components/analytics/page-view-tracker.tsx` as the one small `'use client'` exception outside `quiz/`/`feedback/`, per the story's recommended resolution to the AD-8/AD-9 tension.
- **New finding during implementation (not anticipated in the story):** the story specified Tailwind's `sm:`/`lg:` prefixes (640px/1024px) for the mobile→desktop switch, but DESIGN.md's reference breakpoint is exactly 1280px. Tailwind v4's default `xl:` prefix is exactly 1280px — switched all responsive classes in `Header`/`Hero` from `sm:`/`lg:` to `xl:` so the breakpoint switch happens at the spec'd value, not an approximation. Rebuilt and reverified after the fix.
- `app/page.tsx`/`app/layout.tsx`/`app/globals.css` boilerplate fully replaced as expected (see story's Project Structure Notes) — not a regression.
- CTA on both Header and Hero points to `href="#quiz"`, per the story's CTA-target-scope Dev Note; this anchor intentionally resolves to nothing yet — Epic 2 Story 2.1 will add `<section id="quiz">`.
- Left default `public/*.svg` files in place (unused but harmless, not blocking any AC) — noted as optional cleanup in the story, not done to keep this story's diff focused on its own scope.

### File List

- `app/layout.tsx` (modified)
- `app/page.tsx` (modified)
- `app/globals.css` (modified)
- `components/ui/logo-mark.tsx` (new)
- `components/ui/button-primary.tsx` (new)
- `components/ui/category-tag.tsx` (new)
- `components/landing/header.tsx` (new)
- `components/landing/hero.tsx` (new)
- `components/analytics/page-view-tracker.tsx` (new)
- `lib/analytics/events.ts` (new)
- `lib/analytics/track.ts` (new)
