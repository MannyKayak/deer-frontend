# Disclosure and data contract

Companion to `SPEC.md` (CAP-1 … CAP-3, CAP-12 … CAP-16). Stack-neutral: names what must be true, not how it is built.

## Disclosure matrix

What the server may return, by attempt state. Applies to every user tier, anonymous included.

| Data | Attempt in progress | Attempt submitted |
|------|---------------------|-------------------|
| Question text, options, category | yes | yes |
| Timer, progress | yes | — |
| Answer given by the user | yes (own) | yes |
| Correct answer | **never** | yes |
| Correct / incorrect per question | **never** | yes |
| Mnemonic, state `pubblicata` | **never** | yes |
| Mnemonic, state bozza / in revisione / archiviata | never | **never** |

"Never" means absent from every response body, not hidden in the UI.

## Mnemonic

- States: bozza, in revisione, `pubblicata`, archiviata. At most one `pubblicata` per question.
- Type: `testo` | `scena da immaginare`.
- Storage shape for states and versions: OQ-9.

## `feedback_mnemotecnica`

| Field | Rule |
|-------|------|
| `mnemotecnica_id` | The mnemonic voted on. |
| `utente_id` | Set for logged-in users; mutually exclusive with `id_anonimo`. |
| `id_anonimo` | Set for anonymous users (generation and merge: OQ-8). |
| `valore` | Helpful / not helpful. |
| `creato_il` | Creation timestamp. |

- Uniqueness: one row per (`mnemotecnica_id`, `utente_id`) and per (`mnemotecnica_id`, `id_anonimo`).
- Write is an upsert: a second vote changes `valore`, never adds a row. Replaying the same write is a no-op.
- Client: optimistic update, then the same sync queue used for answers; survives offline and reload.
- Backoffice BO-M3 reads: helpful count and not-helpful count per mnemonic; sort/filter "most negatively voted".

## Paywall count

- N in "Altre N domande, tutte con la loro mnemotecnica" is computed at runtime (definition: OQ-11).
- Errors-seen threshold that triggers the card is a configuration value, not a constant in code.
