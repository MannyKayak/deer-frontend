# Review screen and MnemoCard

Companion to `SPEC.md` (CAP-4 … CAP-11, CAP-15). UI copy is verbatim Italian.

## Per-question content, top to bottom

| # | Element | Rule |
|---|---------|------|
| 1 | Category chip | Always. |
| 2 | Question text | Always. |
| 3 | Answer given | Marked wrong: wrong color **plus** icon or text. Unanswered question: "Non hai risposto" instead, no wrong mark. |
| 4 | Correct answer | Marked correct: correct color **plus** icon or text. |
| 5 | MnemoCard | Only if a `pubblicata` mnemonic exists; visible with no tap. |
| 5′ | "Mnemotecnica in arrivo" | Replaces 5 when no published mnemonic; one discreet line at most, never an empty box. |
| 6 | "Mi aiuta" / "Non mi aiuta" | Below the card, one tap; tapping the lit button withdraws the vote. Absent with 5′. |

## Flow

- **Entry:** result screen → CTA "Rivedi i N errori"; N = wrong + unanswered.
- **Filter:** all errors / only wrong / only unanswered.
- **Switch "Mostra tutte le mnemotecniche":** off by default (errors only); on, the review covers every question of the attempt, correct ones included.
- **Navigation:** previous / next; indicator "Errore 3 di 24"; left/right arrow keys on desktop.
- **Resume:** exit, re-entry, or refresh reopens the last error seen; position stored locally only.
- **End:** summary + CTA "Ripeti la stessa prova" → new attempt on the same questions; question order and option order both reshuffled.
- **Paywall card:** parked until payments are implemented (CAP-15); nothing rendered.

## MnemoCard

| Variant | Rendering |
|---------|-----------|
| `testo` | Title + mnemonic text. |
| `scena da immaginare` | Label such as "Immagina:" + scene text, slightly different visual tone from `testo`. |

- Sticker outline, marked border, flat hard shadow — `box-shadow` with zero blur.
- Gold accent is the mnemonic's identifier; no other element on the screen uses gold.
- Title in Fredoka, content in Inter.
- Must carry bold/ironic copy without reading as a tone error.
- 360px: 5–6-line mnemonics and long options wrap without overflow or truncation.
- WCAG AA contrast; the variant is distinguishable without color (label).

## Tokens

| Role | Value |
|------|-------|
| Mnemonic accent (gold) | `oklch(78% .14 85)` |
| Primary | `oklch(74% .13 178)` |
| Primary dark | `oklch(46% .09 205)` |
| Correct | `oklch(65% .16 145)` |
| Wrong | `oklch(62% .20 20)` |
| Background | `oklch(97% .02 90)` |
| Text | `oklch(22% .02 50)` |
