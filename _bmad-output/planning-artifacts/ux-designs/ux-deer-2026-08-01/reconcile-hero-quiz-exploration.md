# Reconcile — Deer Landing - Hero Quiz Exploration.dc.html (+ support.js)

**What it is:** HTML prototyping-canvas export, 3 "turns" of hero/landing exploration (mobile-first 390px in turn 1, desktop pairings in turn 2, full landing markup in turn 3). Brand consistently "Deer" throughout — this file, not the PDF, is where the brand name and Lexend font are real CSS, not just declared.

**Kept — this is the primary visual source for DESIGN.md and the landing IA in EXPERIENCE.md:**
- Full CSS for every core component: `.btn-cta`, `.chip`, `.qcard`, `.qtag`, `.qtext`, `.opt-btn`/`.opt-correct`, `.mnemo`/`.mnemo-tag`, `.logo-mark`, `.wordmark` — copied into `DESIGN.md.components` near-verbatim (pixel values, OKLCH→hex conversions of the same `:root` palette declared in project-context.md).
- Turn 3, variant 3a (desktop) / 3b (mobile) — the confirmed landing structure per `addendum.md`'s discrepancy table: sticky header, hero with trust bar, two-column comparison, static preview card, dark footer band. This is EXPERIENCE.md's Information Architecture and Responsive & Platform sections.
- Exact copy strings used to cross-check FR-1/FR-2/FR-3 in the PRD (all matched — no discrepancies found beyond the ones addendum.md already flagged and resolved).

**Dropped — reviewed, explicitly not carried into either spine:**
- Turn 1/2, variant **b** ("Badge & numeri, prova sociale sticker") — rotated sticker chips (🦌 3000 domande / ✅ 0 login / ⚡ 2 min) and a gamification badge ("7/10 finora!") on the preview card. Addendum.md marks this shelved for future A/B testing, not this slice. `DESIGN.md.components.chip` is kept as a token (the chip shape is reused elsewhere potentially) but the badge-and-numbers hero *composition* is not part of this slice's IA.
- Turn 1/2, variant **c** ("Il quiz è l'hero") — alternate H1 ("Le 3000 domande ufficiali, trasformate in cose che ricordi."), "Anteprima" tag instead of progress indicator, mnemo-tag reading "🔑 Si sblocca dopo la risposta" instead of "🔑 Mnemotecnica", only 2 answer options shown. Shelved per addendum.md alongside variant b.
- `support.js` — canvas-rendering infrastructure for viewing the `.dc.html` turns (design-tool scaffolding), not a design decision source. Not reconciled into either spine.

**No conflicts with PRD-decided copy** — variant 3a/3b's exact strings ("La strada più veloce...", "Prova 10 domande gratis", "Perché non è l'ennesimo quiz", etc.) match FR-1/FR-2/FR-3 verbatim.
