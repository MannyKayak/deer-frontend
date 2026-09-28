# Report stato progetto — Farmaconcorso / Remindeer

Report generato tramite ispezione diretta del codice al 2026-08-02. Nessun file è stato modificato.

## 1. Struttura generale

- **Next.js**: `16.2.12` (da `package.json`). **Router**: App Router (`app/layout.tsx`, `app/page.tsx`, nessuna cartella `pages/`).
- **React**: `19.2.4`.
- **Package manager**: npm (presente `package-lock.json`; nessun `pnpm-lock.yaml` o `yarn.lock`).
- **Struttura cartelle principali (profondità 2)**:
  ```
  app/                    → layout.tsx, page.tsx, globals.css, favicon.ico
  components/
    analytics/            → page-view-tracker.tsx
    landing/               → header, hero, quiz-preview, comparison-section, comparison-remindeer, comparison-traditional, footer
    quiz/                  → quiz-flow.tsx, results-screen.tsx
    ui/                    → answer-option, button-primary, category-tag, email-capture, logo-mark, mnemo-box, quiz-card, star-rating
  lib/
    actions/               → submitQuizCompletion.ts
    analytics/             → events.ts, track.ts
    content/               → index.ts, questions.ts
    supabase/              → client.ts
  supabase/
    migrations/            → 0001_quiz_completions.sql
  public/                 → asset SVG statici
  _bmad/, _bmad-output/   → scaffolding metodologia BMad (planning artifacts, non applicativo)
  docs/                   → non ispezionato in dettaglio (fuori scope report)
  ```
- **Node version richiesta**: non trovato / da verificare — nessun campo `engines` in `package.json`.

## 2. Cartella `supabase/`

- **File presenti**: unico file `supabase/migrations/0001_quiz_completions.sql`. Nessun `config.toml`, nessuna cartella `functions/`, `seed.sql` o altro.

- **Contenuto integrale di `0001_quiz_completions.sql`**:

  ```sql
  create table if not exists quiz_completions (
    id uuid primary key default gen_random_uuid(),
    score integer not null,
    feedback smallint check (feedback between 1 and 5),
    email text,
    completed_at timestamptz not null
  );

  alter table quiz_completions enable row level security;
  -- No policies defined: RLS with zero policies denies all access to anon/publishable keys.
  -- The server-side secret key (sb_secret_...) bypasses RLS by design (AD-5).
  ```

  Nessuna policy RLS esplicita, nessuna funzione, nessun trigger definiti.

- **File di config Supabase (`config.toml`)**: non trovato / da verificare — assente nel repo.

- **Uso Supabase CLI / project ID linkato**: non trovato / da verificare — nessun riferimento a `supabase link`, nessun project ref nei file ispezionati, nessuna cartella `.supabase` locale trovata.

## 3. Client Supabase

- **Istanziazione**: `lib/supabase/client.ts`, funzione `getSupabaseClient()`.
- **Chiave usata**: la **secret key** (`SUPABASE_SECRET_KEY`), letta da env server-side. Il file è marcato `import "server-only"` — non è mai eseguibile lato client. Il commento nel codice indica esplicitamente che la RLS ha zero policy, quindi solo questa chiave (che bypassa RLS) può leggere/scrivere la tabella.
- **Env var lette nel client**: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`.
- **Elenco nomi env var Supabase in `.env`** (solo nomi, nessun valore riportato):
  - `SUPABASE_URL`
  - `SUPABASE_SECRET_KEY`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_DATABASE_URL`
  - `SUPABASE_REGION`

  Nota: `SUPABASE_PUBLISHABLE_KEY` è presente in `.env` ma **non risulta usata da nessun file del codice** ispezionato (nessun `createClient` lato client trovato). Nessun file `.env.example` presente nel repo.

## 4. Chiamate a Supabase dal frontend

Un'unica chiamata `supabase.from(...)` in tutto il codebase:

| File                                                       | Tabella            | Operazione | Contesto                                                            |
| ---------------------------------------------------------- | ------------------ | ---------- | ------------------------------------------------------------------- |
| `lib/supabase/client.ts` (funzione `insertQuizCompletion`) | `quiz_completions` | `insert`   | Server-only (`import "server-only"`), invocata da una server action |

La server action che la chiama è `lib/actions/submitQuizCompletion.ts` (`"use server"`), a sua volta invocata da `components/quiz/results-screen.tsx` (`"use client"`) tramite `useActionState` + `<form action={formAction}>`. Nessuna chiamata diretta a Supabase da componenti client, nessun `fetch` verso REST/endpoint Supabase trovato.

## 5. Dati "client-side" nella landing (hardcoded)

| Contenuto                                                                                                 | File                                            | Riga circa | Struttura                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10 domande quiz + opzioni + risposta corretta + mnemotecnica                                              | `lib/content/questions.ts`                      | 20–158     | Array tipizzato `Question[]` (oggetti con `id`, `category`, `question`, `options[]`, `correctOptionId`, `mnemonic`) — commento esplicito nel file: **placeholder**, "le vere 10 domande/mnemotecniche saranno fornite dal PO prima del lancio" |
| Statistiche di trust in hero ("3000 domande", "2 min", "0 login")                                         | `components/landing/hero.tsx`                   | 4–8        | Array tipizzato `TRUST_STATS` (oggetti `{value, label}`)                                                                                                                                                                                       |
| Copy hero (titolo, sottotitolo, CTA)                                                                      | `components/landing/hero.tsx`                   | 13–31      | Testo libero JSX                                                                                                                                                                                                                               |
| Copy sezione comparazione (titolo, sottotitolo)                                                           | `components/landing/comparison-section.tsx`     | 8–14       | Testo libero JSX                                                                                                                                                                                                                               |
| Blocco "Con Remindeer"                                                                                    | `components/landing/comparison-remindeer.tsx`   | 7–16       | Testo libero JSX                                                                                                                                                                                                                               |
| Blocco "Metodo tradizionale"                                                                              | `components/landing/comparison-traditional.tsx` | 4–15       | Testo libero JSX                                                                                                                                                                                                                               |
| Footer (nome brand, link privacy/termini — link puntano ad ancore `#privacy`/`#termini` non implementate) | `components/landing/footer.tsx`                 | 5–13       | Testo libero JSX                                                                                                                                                                                                                               |
| Header (nome brand, CTA)                                                                                  | `components/landing/header.tsx`                 | 9–15       | Testo libero JSX                                                                                                                                                                                                                               |
| Testo consenso email marketing                                                                            | `components/ui/email-capture.tsx`               | 57–58      | Testo libero JSX, commentato esplicitamente come **placeholder in attesa di testo legale** (`[ASSUMPTION: placeholder consent copy pending legal text — see PRD OQ-3]`)                                                                        |
| Metadata SEO (title/description)                                                                          | `app/layout.tsx`                                | 16–18      | Oggetto tipizzato `Metadata`                                                                                                                                                                                                                   |

Non sono presenti FAQ nel codice ispezionato.

## 6. Autenticazione

- **Codice di autenticazione**: non trovato / da verificare — nessuna dipendenza auth in `package.json`, nessun uso di Supabase Auth (`supabase.auth.*`), nessuna route/middleware di login.
- **Ruoli utente / concetto "admin"**: non trovato / da verificare — né nel codice applicativo né nella migration SQL. I match del grep per "admin/auth/role/session" erano falsi positivi (attributo HTML `role="radio"`/`role="radiogroup"` in `star-rating.tsx`, e la stringa di copy "0 login richiesti" in `hero.tsx`).

## 7. API routes / server actions esistenti

- **Route API** (`app/api/...` o `pages/api/...`): nessuna trovata.
- **Server actions**:
  | Path                                                           | Scopo                                                                                                                                                                                                                                |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `lib/actions/submitQuizCompletion.ts` — `submitQuizCompletion` | Valida (zod) risposte quiz + rating + email/consenso, ricalcola lo score server-side dal contenuto in `lib/content` (mai fidandosi dello score del client), poi inserisce il record in `quiz_completions` via `insertQuizCompletion` |

## 8. Deploy e configurazione

- **`vercel.json`**: non trovato / da verificare — assente.
- **`next.config.ts`**: presente, contenuto:
  ```ts
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {/* config options here */};

  export default nextConfig;
  ```
  Configurazione vuota/default.
- **Domini custom**: non trovato / da verificare — nessun riferimento a domini nel codice o nella config ispezionati.

## 9. Dipendenze rilevanti (da `package.json`)

- **Supabase**: `@supabase/supabase-js` `^2.111.0` (unica dipendenza Supabase; nessun `@supabase/ssr` o `@supabase/auth-helpers-*`).
- **ORM**: non trovato / da verificare — nessun Prisma o altro ORM, accesso diretto via supabase-js.
- **Auth**: non trovato / da verificare — nessuna libreria auth presente.
- **Styling**: Tailwind CSS `^4` + `@tailwindcss/postcss` `^4` — configurazione Tailwind v4 è CSS-first (verificare `app/globals.css` per `@theme`/direttive, non è stato ispezionato un file `tailwind.config.*` separato perché in v4 tipicamente non è richiesto).
- **Form handling**: nessuna libreria dedicata (es. react-hook-form) — gestione form nativa via `useState` + server actions (`useActionState`) + validazione `zod` `^4.4.3` lato server.
- **Altro**: `server-only` `^0.0.1` (enforcement a build-time che certi moduli non finiscano nel bundle client).

## 10. Git

- **Repo remoto**: sì, hosting **GitHub** (origin configurato).
- **`.gitignore`**: presente e include `.env*` (esclude tutti i file env) e `/node_modules`. Conferma corretta: i segreti in `.env` non sono tracciati da git.

## Osservazioni tecniche

1. **Migration SQL senza policy RLS**: la tabella `quiz_completions` ha RLS abilitata ma zero policy — quindi è accessibile _solo_ dalla secret key server-side. È una scelta di design intenzionale e documentata nel commento SQL, ma va tenuta a mente in fase di scorporo: se il backoffice futuro userà la publishable key o un ruolo diverso, servirà scrivere le policy mancanti.

2. **`SUPABASE_PUBLISHABLE_KEY` presente in `.env` ma non usata nel codice**: possibile residuo predisposto per un client-side futuro (es. backoffice), oppure dead config. Da chiarire prima dello scorporo per evitare di portare dietro credenziali inutilizzate.

3. **Contenuto quiz (10 domande) è hardcoded e dichiaratamente placeholder**: commentato esplicitamente nel codice come dati provvisori in attesa del contenuto reale da parte del PO. `lib/content/index.ts` è già stato progettato come singolo seam/accessor per questo — un buon punto di innesto quando il contenuto reale passerà a Supabase o CMS, ma oggi è puro codice statico versionato nel repo, non dati.

4. **Nessun backoffice/admin esiste ancora nel codice**: il progetto oggi è _solo_ la landing/quiz pubblico più un'unica write-action verso Supabase. Lo "scorporo backend/backoffice" quindi riguarda soprattutto migration SQL + client Supabase + eventualmente la server action, che sono già ragionevolmente isolati (`lib/supabase/`, `lib/actions/`, `supabase/migrations/`) — non richiede disaccoppiare codice UI misto.

5. **Assenza di `supabase/config.toml` e di collegamento CLI esplicito**: se il progetto Supabase è gestito solo da dashboard remota (non linkato via CLI), lo scorporo dovrà stabilire da zero il workflow di migration (CLI init/link) nel nuovo progetto backend.

6. **Nessun `.env.example`**: rende meno immediato ricostruire il set di env var richieste in un nuovo progetto scorporato; consigliato crearne uno prima dello split.

7. **Link footer non funzionali**: `#privacy` e `#termini` sono ancore placeholder senza pagine corrispondenti — non bloccante per lo scorporo backend, ma da segnalare.

8. **Copy consenso email è placeholder legale** (commento esplicito nel codice) — rilevante se il backoffice dovrà gestire consensi/marketing in modo conforme.

9. **Nessuna API route esposta**: tutta la comunicazione col backend passa da un'unica server action Next.js (non un endpoint REST/HTTP autonomo). Nello scorporo, se il backoffice deve accedere agli stessi dati, andrà probabilmente introdotta un'API dedicata (oggi non esiste alcuna route riusabile).
