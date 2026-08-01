# PRD Quality Review — prd-deer-2026-08-01

## Overall verdict

This is a tight, honest PRD for the narrow slice it claims to cover: FRs carry literal copy and concrete, testable consequences rather than adjectives, the validation thesis (measure engagement before building the 3000-question product) is carried consistently into SM-1/SM-2 and the named counter-metric SM-C1, and scope omissions are tracked explicitly rather than left to inference. It falls short of "strong" on two mechanical fronts that matter because this document explicitly feeds downstream UX/architecture/story work (§0): FR-5's sole accessibility requirement points to a "Cross-Cutting NFR" section that does not exist anywhere in the document, and the Assumptions Index (§9) contradicts itself (claims one open assumption, lists two, one already marked confirmed). Neither breaks the PRD's usefulness for building the slice, but both will cost a downstream reader real time.

## Decision-readiness — strong

Decisions are stated as decisions, not hedged. The addendum's discrepancy table (brand name Deer vs Farmaconcorso, font Lexend vs Fredoka, CTA copy) names what was in tension and what was chosen, not just the outcome. Open Questions (§8, OQ-1..OQ-6) are genuinely unresolved — e.g. OQ-6 "Dominio non ancora deciso" has no answer smuggled into the next sentence. No hedge language ("potrebbe", "dovrebbe", "in generale") appears anywhere in the document. No findings.

## Substance over theater — strong

Both UJs (§2.3) share one named protagonist (Marta) in two different entry contexts (skeptical mobile visitor vs. deliberate desktop evaluator) rather than multiplying personas for coverage — this is restraint, not persona theater. The Vision (§1) makes a specific, falsifiable claim ("il problema non è l'accesso... è ricordarle") rather than a swappable positioning paragraph. No findings.

## Strategic coherence — strong

The thesis — access to the 3000 questions isn't the problem, retention is, so validate the mnemonic mechanism before building the rest — is carried end to end: FR-5's mnemonic unlock is the mechanism under test, SM-1 (completion rate) and SM-2 (email opt-in) measure whether the mechanism lands, and SM-C1 explicitly guards against gaming SM-1 by "simplifying questions or removing the mnemonic" (§7). This is a validation-shaped MVP with scope logic that matches (10-question no-login taste test, not a feature backlog). No findings.

## Done-ness clarity — adequate

### Findings

- **critical** Sole NFR requirement points to a section that doesn't exist (§4.2, FR-5) — FR-5's accessibility conseguenza reads "requisito di accessibilità, vedi NFR trasversali § Cross-Cutting NFR", but no section by that name (or any "NFR"/"Cross-Cutting" heading) exists anywhere in prd.md — confirmed by full-document grep. The document has no dedicated NFR section at all: no performance bound for the "2 minuti" quiz promise (SM-3 measures it but no target is stated as a requirement), no stated accessibility level (e.g. WCAG AA), no explicit security/data-handling bound beyond the FR-9 consent-copy assumption. For a public page collecting email + feedback under GDPR (per project-context.md), this is a real gap, not just a dangling pointer. *Fix:* either add a short "Cross-Cutting NFR" section (accessibility level, performance bound, data-handling bound) or strip the reference and fold the requirement into FR-5's own conseguenze.
- **low** FR-11's abandonment tracking is conditionally testable — "domanda a cui l'utente abbandona (se rilevabile lato client)" (§4.4) hedges the one analytics conseguenza that isn't already covered by SM-1. *Fix:* state the fallback (e.g., "if not client-detectable, abandonment is inferred from missing completion event") so it's testable either way.

All other FRs (FR-1 through FR-10) are unusually concrete for this stage — literal headline/CTA/microcopy strings, explicit "no auto-advance" behavior (FR-5), explicit non-persistence behavior (FR-6) — and need no findings.

## Scope honesty — strong

§5 Non-Goals is substantive (no login, no full 3000-question bank, no timed simulation, no admin backoffice, no payments, no cross-session persistence, no mascot — each with a one-line reason). §6.2 Out of Scope cross-references OQ-1..OQ-4 rather than silently assuming placeholders will resolve themselves. Open-items density (6 OQs + 2 assumption-index entries) is proportionate for a confirmed-placeholder, pre-build validation slice — matches the stakes described by the user context. One integrity issue, noted below under Mechanical notes, slightly undercuts this: the Assumptions Index's own bookkeeping is self-contradictory.

## Downstream usability — adequate

The PRD explicitly names itself as chain-top (§0: "è rivolto a chi implementerà questo slice... e a chi lo validerà a valle (UX, architettura, epiche/storie)"), so this dimension carries full weight rather than the reduced weight standalone PRDs get. Glossary (§3) terms are used consistently in the FRs that matter most (Mnemotecnica, Domanda ufficiale, Schermata finale, Opt-in email). FR/UJ/SM/OQ IDs are contiguous and unique (FR-1..11, UJ-1..2, SM-1..4 + SM-C1, OQ-1..6) with no gaps or duplicates found.

### Findings

- **high** Cross-reference to "Cross-Cutting NFR" resolves to nothing (§4.2, FR-5) — same defect as the Done-ness finding above, restated here because it specifically breaks the "cross-references resolve" bar for downstream extraction: a UX or architecture reader following this pointer finds no target. *Fix:* same as above.
- **medium** Feedback mechanism drifts between Glossary/UJ language and the operative FR — the Glossary (§3) defines **Box feedback** as "faccine/cuori/stelle" and both UJ-1 (§2.3, "faccine/cuori/stelle") and project-context.md repeat the three-way phrasing, but FR-8 (§4.3) — the actual testable requirement — commits to a single mechanism: "Componente rating a stelle (5 livelli)." A downstream builder sourcing only the Glossary or UJ would not know the emoji/heart options were dropped in favor of stars-only. *Fix:* update Glossary and UJ-1 to say "stelle (5 livelli)" to match FR-8, or clarify in FR-8 that "faccine/cuori/stelle" are presentation variants of one component.

## Shape fit — strong

Consumer product with meaningful UX → UJs are load-bearing here, and the PRD gets the dosage right: two UJs, one named protagonist (Marta) carrying context inline (device, entry point, skepticism level), not four-plus personas for appearance. This is the correct shape for a landing+quiz validation slice — not over-formalized (no UJ sprawl) and not under-formalized (UX-heavy product isn't reduced to a bare capability list). No findings.

## Mechanical notes

- **Broken cross-reference**: FR-5 (§4.2, line ~222) cites "NFR trasversali § Cross-Cutting NFR" — this section does not exist anywhere in prd.md (verified via full-text search). This is the single most consequential mechanical defect in the document; see Done-ness and Downstream usability findings above.
- **Assumptions Index self-contradiction** (§9): the index states "Resta un'unica assunzione aperta" (only one open assumption remains) and then lists **two** bullets (FR-9 consent copy, FR-10 static-content-in-repo). Worse, the second bullet (FR-10, static content in repo) is *also* listed earlier in the same paragraph among items already "confirmed with the PO" ("contenuto domande statico nel repo"). As written, it's unclear whether the static-repo-content decision is closed (per the confirmed-list) or still an open assumption (per its own bullet). *Fix:* either drop the FR-10 bullet (if truly confirmed, it isn't an open assumption) or reword "un'unica" to reflect that two items remain open.
- **Inline/index roundtrip gap**: only one inline `[ASSUMPTION: ...]` tag exists in the body (FR-9, §4.3, line 288). The second §9 index bullet (FR-10) has no corresponding inline `[ASSUMPTION]` tag in §4.4 — it reads there as a confirmed decision ("confermato col PO"), reinforcing the contradiction above rather than an independent miss.
- **Minor glossary drift**: §0 uses the unhyphenated compound "quiz-assaggio" once ("landing page con quiz-assaggio senza login"), while the defined Glossary term (§3) and every other usage is "Quiz di assaggio" / "quiz di assaggio". Cosmetic only.
- **Feedback mechanism drift**: see Downstream usability finding above (Glossary/UJ say "faccine/cuori/stelle", FR-8 says stars-only) — flagged there as medium since it affects a specific buildable requirement, not just wording.
- No dangling OQ/FR/SM cross-references found otherwise; ID sequences are contiguous with no gaps or duplicates.
