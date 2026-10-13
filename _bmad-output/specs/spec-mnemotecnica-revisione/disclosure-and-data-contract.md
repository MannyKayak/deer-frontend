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
| `id_anonimo` | Set for anonymous users. At registration the user's anonymous votes move to `utente_id`; if both exist for the same mnemonic, one row survives. Mechanism: OQ-8. |
| `valore` | Helpful / not helpful. |
| `creato_il` | Creation timestamp. |

- Uniqueness: one row per (`mnemotecnica_id`, `utente_id`) and per (`mnemotecnica_id`, `id_anonimo`).
- Write is an upsert: a second vote changes `valore`, never adds a row. Replaying the same write is a no-op.
- A vote can be withdrawn: tapping the lit button clears it. A withdrawn vote counts in neither total; withdrawing is idempotent too. The last action wins when queued writes replay in order.
- Client: optimistic update, then the same sync queue used for answers; survives offline and reload.
- Backoffice BO-M3 reads: helpful count and not-helpful count per mnemonic; sort/filter "most negatively voted".

## Votes and versions

- A vote is tied to one mnemonic version. When the backoffice publishes a rewritten mnemonic, it starts from zero votes; earlier votes stay with the archived version and the user's buttons appear unlit on the new one.

## Access and paywall

- The backoffice decides which questions are free. The frontend receives only the content the current user may access; it applies no free/paid filtering of its own.
- Paywall card, its copy, and its trigger are parked until payments are implemented (CAP-15). When reopened, the copy comes from the backoffice.
