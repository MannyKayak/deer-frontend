# Reconcile — Design System Farmaconc v2.pdf

**What it is:** 2-page standalone design-system doc, brand labeled "Farmaconcorso" (not "Deer") throughout. Declares palette, typography, and a handful of component shapes, plus 4 example screens.

**Kept:**
- OKLCH palette values — identical to the ones in `project-context.md` and to the `:root` CSS variables in the HTML exploration file. Cross-validates the palette rather than adding new information; `DESIGN.md.colors` hex values are the same source, converted.
- Component *shapes* implied by the example screens (flashcard-style card, few-and-large buttons, progress bar) — consistent with, and superseded in specificity by, the real CSS in the HTML exploration file.
- Mascot placeholder ("mascotte — da decidere") — confirms the PRD's own TBD note; both agree it's undecided, and discovery resolved it as "no mascot for v1."

**Overridden by user decision (conflicts flagged, resolved during Discovery — see `.memlog.md`):**
- Brand name "Farmaconcorso" → **Deer** wins (PRD/project-context/HTML exploration all agree on Deer; this PDF is the outlier).
- Title typeface "Fredoka" → **Lexend** wins (project-context.md marked DECISO; the HTML exploration's real CSS also loads Lexend, not Fredoka — the PDF's stated typeface was never actually implemented anywhere else).

**Dropped — explicitly out of scope for this slice, not carried into either spine:**
- Screen 3, "Simulazione completata" — 100-question timed result, percentage ring, "aree più deboli" breakdown.
- Screen 4, "Ciao, Stanis 👋" dashboard — personalized greeting, streak counter, countdown to exam, "aree da rinforzare."
- Timer component, Streak/badge component, "Salta" (skip) button — all belong to the full-product post-login experience. Explicitly rejected for v1 in `EXPERIENCE.md.Inspiration & Anti-patterns`, with rationale.

These full-product screens remain a useful forward reference (noted in EXPERIENCE.md) for whichever future workflow scopes the full Deer product PRD — not reused here.
