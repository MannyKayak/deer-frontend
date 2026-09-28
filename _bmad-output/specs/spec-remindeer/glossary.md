# Glossary — Remindeer

- **Remindeer** — product/brand name for this slice (confirmed by PO over "Farmaconcorso," an alternate name found in one design source).
- **Mnemotecnica (mnemonic)** — mnemonic association (image, wordplay) tied to one official question, shown after the visitor answers.
- **Quiz di assaggio (taste quiz)** — the no-login flow over all free questions this slice builds. Distinct from the future "simulazione" (100-question timed exam simulation), out of scope here.
- **Domanda ufficiale (official question)** — one of the 3000 official public-exam questions for pharmacy licensing. This slice shows every free question (`is_free`), read from Supabase.
- **Sede farmaceutica** — the pharmacy license assigned via the public exam Remindeer prepares candidates for.
- **Schermata finale (final screen)** — screen shown after the last question: score, per-question recap (mnemonic on wrong answers), feedback box, optional email field.
- **Box feedback (feedback box)** — 5-level star rating component on the final screen.
- **Opt-in email** — optional email field on the final screen for launch updates. Not an account.
- **PO (Product Owner)** — owner of code, data, and all infra accounts (Supabase, Vercel, analytics, domain).
- **Backoffice** — separate repo (ADR-004) owning the Supabase content schema and content authoring. Shares the Supabase project with this landing.
- **Domanda gratuita (free question)** — `questions.is_free = true`; the only questions anon can read. Premium questions are a later phase.
- **check_answer** — Supabase RPC returning correctness for one (question, option) pair; the only way to learn which option is correct.
