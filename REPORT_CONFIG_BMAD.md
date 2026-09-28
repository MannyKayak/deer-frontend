# Report configurazione BMad — progetto "remindeer"

Report solo ispezione, nessun file modificato.

## 1. Versione e installazione

- **Versione**: 6.10.0 (da `_bmad/_config/manifest.yaml`, `_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`).
- **Moduli installati**: `core` v6.10.0, `bmm` v6.10.0, entrambi `source: built-in`, `npmPackage: null`, `repoUrl: null` — non vendorizzati da un pacchetto npm registrato come dipendenza del progetto.
- **IDE collegato**: `claude-code` (unico IDE in `ides:` nel manifest).
- **Non è una dipendenza npm**: `package.json` non contiene alcun riferimento a bmad (né in `dependencies` né `devDependencies` né `scripts`).
- **Installato via CLI on-demand**: in `.claude/settings.local.json` è allowlisted `Bash(npx bmad-method *)` — installer invocato con `npx bmad-method` (non installato localmente come pacchetto persistente).
- **Due copie parallele dei file**: `_bmad/` (sorgente/installer-managed, contiene i file "canonici" con hash in `_config/files-manifest.csv`) e `.claude/skills/` (le skill effettivamente caricate da Claude Code, ciascuna con `SKILL.md` + `customize.toml`). Il layout è identico per nome skill in entrambe le cartelle.
- Data installazione: 2026-08-01T13:35:44Z circa.

## 2. Struttura delle cartelle

### `_bmad/` (profondità 2-3)

```
_bmad/
├── _config/
│   ├── manifest.yaml          — versione installazione, moduli, IDE collegati
│   ├── files-manifest.csv     — hash di ogni file installato (per rilevare drift/aggiornamenti)
│   ├── skill-manifest.csv     — indice di tutte le skill (canonicalId, nome, descrizione, modulo, path)
│   └── bmad-help.csv          — dati di supporto per la skill bmad-help
├── bmm/                       — modulo "BMad Method" (workflow di prodotto: analysis→plan→solutioning→implementation)
│   ├── config.yaml            — config modulo bmm (percorsi output, lingua, nome progetto)
│   ├── module-help.csv
│   ├── 1-analysis/            — agenti/skill fase analisi (analyst, tech-writer, prfaq, product-brief, research)
│   ├── 2-plan-workflows/      — agenti/skill fase planning (pm, ux-designer, prd, ux)
│   ├── 3-solutioning/         — agenti/skill fase solutioning (architect, architecture, epics&stories, readiness check)
│   └── 4-implementation/      — agenti/skill fase implementazione (dev, dev-story, quick-dev, code-review, sprint, retro)
├── core/                      — modulo core, skill trasversali (brainstorming, party-mode, spec, customize, ecc.)
│   ├── config.yaml
│   └── module-help.csv
├── custom/                    — override team/personali (VUOTI in questo progetto — solo commenti di esempio)
│   ├── config.toml            — override team (committed)
│   ├── config.user.toml       — override personali (gitignored)
│   └── .gitignore             — ignora *.user.toml
└── scripts/
    ├── resolve_config.py      — risolve config effettiva (merge installer + custom + custom.user)
    ├── resolve_customization.py
    └── memlog.py              — gestisce i file `.memlog.md` nelle run di workflow
```

### `.claude/skills/` (mirror operativo, profondità 2)

Una cartella per ogni skill installata (stesso set elencato in `skill-manifest.csv`), ciascuna con:

- `SKILL.md` — istruzioni/prompt della skill
- `customize.toml` — override specifici del progetto (in questo progetto **tutti vuoti/default**, vedi punto 4)
- asset accessori quando previsti (`templates/`, `assets/`, `steps/`, `checklist.md`, script `.py`, ecc.)

Skill agente presenti: `bmad-agent-analyst` (Mary), `bmad-agent-pm` (John), `bmad-agent-ux-designer` (Sally), `bmad-agent-architect` (Winston), `bmad-agent-dev` (Amelia), `bmad-agent-tech-writer` (Paige).

### `_bmad-output/` (profondità 2-3)

```
_bmad-output/
├── project-context.md                                — fatti/decisioni di progetto persistenti (letto da tutti i workflow)
├── planning-artifacts/
│   ├── prds/prd-remindeer-2026-08-01/                      — PRD + addendum + rubrica di review + memlog
│   ├── ux-designs/ux-remindeer-2026-08-01/                 — DESIGN.md, EXPERIENCE.md, reconcile-*.md, imports/, mockups/
│   ├── architecture/architecture-remindeer-2026-08-01/      — ARCHITECTURE-SPINE.md, SOLUTION-DESIGN.md, reviews/
│   ├── epics.md                                        — epic breakdown
│   └── implementation-readiness-report-2026-08-01.md   — report di validazione pre-sviluppo
├── implementation-artifacts/
│   ├── sprint-status.yaml                              — stato epic/story (tracking_system: file-system)
│   └── <epic>-<story>-<slug>.md                        — file story per lo sviluppo (10 file, epic 1-3)
└── specs/spec-remindeer/
    ├── SPEC.md                                         — kernel SPEC con companion links a DESIGN/EXPERIENCE/ARCHITECTURE
    ├── glossary.md
    └── .memlog.md
```

## 3. Configurazione (contenuto integrale)

### `_bmad/config.toml` (installer-managed, non toccare a mano)

```toml
[core]
project_name = "remindeer"
document_output_language = "English"
output_folder = "_bmad-output"

[modules.bmm]
planning_artifacts = "{project-root}/_bmad-output/planning-artifacts"
implementation_artifacts = "{project-root}/_bmad-output/implementation-artifacts"
project_knowledge = "{project-root}/docs"

[agents.bmad-agent-analyst]
module = "bmm"
team = "software-development"
name = "Mary"
title = "Business Analyst"
icon = "📊"
description = "Channels Porter's strategic rigor and Minto's Pyramid Principle, grounds every finding in verifiable evidence, represents every stakeholder voice. Speaks like a treasure hunter narrating the find: thrilled by every clue, precise once the pattern emerges."

[agents.bmad-agent-tech-writer]
module = "bmm"
team = "software-development"
name = "Paige"
title = "Technical Writer"
icon = "📚"
description = "Master of CommonMark, DITA, and OpenAPI; turns complex concepts into accessible structured docs, favors diagrams over walls of text, every word earning its place. Speaks like the patient teacher you wish you'd had, using analogies that make complex things feel simple."

[agents.bmad-agent-pm]
module = "bmm"
team = "software-development"
name = "John"
title = "Product Manager"
icon = "📋"
description = "Drives Jobs-to-be-Done over template filling, user value first, technical feasibility is a constraint not the driver. Speaks like a detective interrogating a cold case: short questions, sharper follow-ups, every 'why?' tightening the net."

[agents.bmad-agent-ux-designer]
module = "bmm"
team = "software-development"
name = "Sally"
title = "UX Designer"
icon = "🎨"
description = "Balances empathy with edge-case rigor, starts simple and evolves through feedback, every decision serves a genuine user need. Speaks like a filmmaker pitching the scene before the code exists, painting user stories that make you feel the problem."

[agents.bmad-agent-architect]
module = "bmm"
team = "software-development"
name = "Winston"
title = "System Architect"
icon = "🏗️"
description = "Favors boring technology for stability, developer productivity as architecture, ties every decision to business value. Speaks like a seasoned engineer at the whiteboard: measured, always laying out trade-offs rather than verdicts."

[agents.bmad-agent-dev]
module = "bmm"
team = "software-development"
name = "Amelia"
title = "Senior Software Engineer"
icon = "💻"
description = "Test-first discipline (red, green, refactor), 100% pass before review, no fluff all precision. Speaks like a terminal prompt: exact file paths, AC IDs, and commit-message brevity — every statement citable."
```

### `_bmad/config.user.toml` (installer-managed, personale)

```toml
[core]
user_name = "Gusta"
communication_language = "English"

[modules.bmm]
user_skill_level = "intermediate"
```

### `_bmad/bmm/config.yaml`

```yaml
user_skill_level: intermediate
planning_artifacts: "{project-root}/_bmad-output/planning-artifacts"
implementation_artifacts: "{project-root}/_bmad-output/implementation-artifacts"
project_knowledge: "{project-root}/docs"
user_name: Gusta
project_name: remindeer
communication_language: English
document_output_language: English
output_folder: _bmad-output
```

### `_bmad/core/config.yaml`

```yaml
user_name: Gusta
project_name: remindeer
communication_language: English
document_output_language: English
output_folder: _bmad-output
```

### `_bmad/custom/config.toml` (team override — VUOTO, solo commenti)

```toml
# Team / enterprise overrides for _bmad/config.toml.
# Committed to the repo — applies to every developer on the project.
# Tables deep-merge over base config; keyed entries merge by key.
# Example: override an agent descriptor, or add a new agent.
#
# [agents.bmad-agent-pm]
# description = "Prefers short, bulleted PRDs over narrative drafts."
```

### `_bmad/custom/config.user.toml` (override personale — VUOTO)

```toml
# Personal overrides for _bmad/config.toml.
# NOT committed (gitignored) — applies only to your local install.
# Wins over both base config and team overrides.
```

### `_bmad/_config/manifest.yaml`

```yaml
installation:
  version: 6.10.0
  installDate: 2026-08-01T13:35:45.551Z
  lastUpdated: 2026-08-01T13:35:45.551Z
modules:
  - name: core
    version: 6.10.0
    installDate: 2026-08-01T13:35:44.666Z
    lastUpdated: 2026-08-01T13:35:45.548Z
    source: built-in
    npmPackage: null
    repoUrl: null
  - name: bmm
    version: 6.10.0
    installDate: 2026-08-01T13:35:44.949Z
    lastUpdated: 2026-08-01T13:35:45.551Z
    source: built-in
    npmPackage: null
    repoUrl: null
ides:
  - claude-code
```

## 4. Agenti usati

Sei agenti bmm configurati, tutti presi dal team preset `software-development` (vedi `[agents.*]` sopra):

| Agente                   | Nome    | Codice skill             | Personalizzato? |
| ------------------------ | ------- | ------------------------ | --------------- |
| Business Analyst         | Mary    | `bmad-agent-analyst`     | No              |
| Product Manager          | John    | `bmad-agent-pm`          | No              |
| UX Designer              | Sally   | `bmad-agent-ux-designer` | No              |
| System Architect         | Winston | `bmad-agent-architect`   | No              |
| Senior Software Engineer | Amelia  | `bmad-agent-dev`         | No              |
| Technical Writer         | Paige   | `bmad-agent-tech-writer` | No              |

**Nessuna personalizzazione reale.** Ho controllato ogni `customize.toml` in `.claude/skills/*/customize.toml` (uno per skill, ~40 file): contengono solo i valori di default generati dall'installer (nome/titolo/icona/persona identici al preset, `activation_steps_prepend/append` vuoti, `on_complete` vuoto). L'unica riga "custom" presente ovunque è:

```toml
persistent_facts = [
  "file:{project-root}/**/project-context.md",
]
```

che è il meccanismo standard con cui ogni agente/skill legge `_bmad-output/project-context.md` a ogni attivazione — non è un override di prompt, è configurazione di default del progetto.

`_bmad/custom/config.toml` e `_bmad/custom/config.user.toml` (i file dove finirebbero override reali di descrizione agente) sono vuoti — solo commenti di esempio.

## 5. Artifact generati in `_bmad-output/`

**Planning:**

- `project-context.md` — decisioni tecniche/vincoli di progetto (fonte di verità), prodotto: piattaforma quiz mnemotecnico per concorso farmacia
- `planning-artifacts/prds/prd-remindeer-2026-08-01/prd.md` — PRD: Remindeer — Landing + Quiz di Assaggio
- `.../prd-remindeer-2026-08-01/addendum.md` — Addendum al PRD
- `.../prd-remindeer-2026-08-01/review-rubric.md` — PRD Quality Review
- `planning-artifacts/ux-designs/ux-remindeer-2026-08-01/DESIGN.md` — Brand & Style
- `.../ux-remindeer-2026-08-01/EXPERIENCE.md` — Experience Spine (flussi utente)
- `.../ux-remindeer-2026-08-01/reconcile-design-system-pdf.md` — riconciliazione import PDF design system
- `.../ux-remindeer-2026-08-01/reconcile-hero-quiz-exploration.md` — riconciliazione mockup HTML hero/quiz
- `.../ux-remindeer-2026-08-01/reconcile-whatsapp-image.md` — riconciliazione screenshot WhatsApp
- `planning-artifacts/architecture/architecture-remindeer-2026-08-01/ARCHITECTURE-SPINE.md` — Architecture Spine
- `.../architecture-remindeer-2026-08-01/SOLUTION-DESIGN.md` — Solution Design
- `.../reviews/review-adversarial.md` — review adversariale architettura
- `.../reviews/review-rubric-walker.md` — review a rubrica architettura
- `.../reviews/review-version-check.md` — check versioni/realtà librerie
- `planning-artifacts/epics.md` — Epic Breakdown (3 epic)
- `planning-artifacts/implementation-readiness-report-2026-08-01.md` — Report di prontezza implementazione

**Implementation:**

- `implementation-artifacts/sprint-status.yaml` — stato sprint (epic 1-3, tutte le story `done`)
- `1-1-hero-with-cta.md` — Story 1.1: Hero with CTA
- `1-2-comparison-section.md` — Story 1.2: Comparison Section
- `1-3-minimal-footer.md` — Story 1.3: Minimal Footer
- `1-4-in-page-quiz-preview.md` — Story 1.4: In-Page Quiz Preview
- `2-1-quiz-flow-start-single-question-presentation.md` — Story 2.1: avvio quiz, presentazione singola domanda
- `2-2-answer-reveal-mnemonic-unlock-advance.md` — Story 2.2: reveal risposta, sblocco mnemotecnica, avanzamento
- `2-3-results-screen.md` — Story 2.3: schermata risultati
- `3-1-feedback-box.md` — Story 3.1: box feedback
- `3-2-optional-email-capture-with-consent.md` — Story 3.2: raccolta email opzionale con consenso
- `3-3-quiz-completion-write-cookieless-analytics.md` — Story 3.3: scrittura completamento quiz + analytics cookieless

**Specs:**

- `specs/spec-remindeer/SPEC.md` — kernel SPEC, con companion link a glossary + DESIGN + EXPERIENCE + ARCHITECTURE + project-context
- `specs/spec-remindeer/glossary.md` — glossario termini di progetto

Ogni cartella di run (`prd-remindeer-*`, `ux-remindeer-*`, `architecture-remindeer-*`) contiene anche un `.memlog.md` (log interno del workflow, gestito da `_bmad/scripts/memlog.py`).

## 6. Template personalizzati

**Nessuno.** Tutti i `customize.toml` ispezionati puntano ai template di default installati dentro ogni skill (es. `bmad-prd`: `prd_template = "assets/prd-template.md"`, `bmad-ux`: vari `assets/design-example-*.md`, `bmad-architecture`: `spine_template = "assets/spine-template.md"`). Nessun campo contiene un path o contenuto sovrascritto rispetto al default dell'installer. Il formato di PRD/story/architecture usato in questo progetto è quindi lo standard BMad 6.10.0, non un adattamento custom — replicarlo nel nuovo progetto significa semplicemente installare la stessa versione, non copiare template.

## 7. Punti di integrazione

- **Script npm**: nessuno. `package.json` non ha script `bmad*`; l'unico punto d'ingresso è `npx bmad-method` invocato ad-hoc (vedi allowlist in `.claude/settings.local.json`).
- **Tool esterni**: nessun riferimento a Trello o altro PM tool trovato (grep su tutto il repo per "trello": zero risultati). `sprint-status.yaml` dichiara esplicitamente `tracking_system: file-system` — tracking dello sprint è puramente su file, non collegato a board esterne.
- **Handoff di design esterni**: `bmad-ux/customize.toml` referenzia Google Stitch (`https://stitch.withgoogle.com`) come possibile handoff per generare DESIGN.md/screen HTML — è un default della skill, non una integrazione attivata nel progetto (in questo progetto gli import UX sono stati fatti manualmente da file locali in `Downloads`, copiati in `imports/` dentro la cartella UX, vedi permessi `cp ...` in `settings.local.json`).
- **`.claude/settings.local.json`**: allowlist di comandi shell usati durante le sessioni BMad (npx bmad-method, uv run per script Python del resolver config, pdftoppm/pymupdf per leggere PDF di design, npm/git/tsc per sviluppo). Nessuna integrazione MCP o webhook dedicata a BMad.
- **Cartella `docs/`**: referenziata come `project_knowledge` in `bmm/config.yaml` ma non ispezionata qui — verificare se esiste e cosa contiene, se rilevante per il nuovo progetto.

## Cosa replicare nel nuovo progetto backoffice

**Da portare identico:**

- Versione BMad: installare **6.10.0** (o versione più recente se si accetta drift consapevole — ma per "nessuna divergenza" pinnare 6.10.0).
- Metodo di installazione: `npx bmad-method` (stesso comando, non aggiungere come dipendenza npm).
- Modulo `bmm` + `core`, stesso set di 6 agenti (`Mary/John/Sally/Winston/Amelia/Paige`) — sono il preset di default `software-development`, non richiedono configurazione aggiuntiva.
- Struttura cartelle: `_bmad/`, `_bmad-output/` con le stesse sottocartelle (`planning-artifacts/{prds,ux-designs,architecture}`, `implementation-artifacts/`, `specs/`), perché sono i path di default in `bmm/config.yaml` — bastano le risposte standard all'installer (`output_folder = "_bmad-output"`).
- `_bmad/custom/config.toml` e `.toml.user` vanno creati vuoti (com'è qui) — nessun override da portare perché qui non esiste nessuno.
- Template PRD/UX/Architecture/Story: **non c'è nulla da copiare a mano**, sono quelli di default della skill — verranno installati automaticamente con la stessa versione.
- `project_name`/`communication_language`/`document_output_language`: valori banali da re-impostare in fase di installer (project_name = nome nuovo progetto backoffice), non da copiare letteralmente.

**Da rigenerare da zero (specifico dominio landing/quiz farmacia, non riusabile per backoffice):**

- `project-context.md` — contiene decisioni di prodotto specifiche di Remindeer (quiz farmacia, mnemotecniche, tono di voce). Va scritto da capo per il dominio backoffice.
- Tutto `planning-artifacts/` (PRD, UX DESIGN/EXPERIENCE, ARCHITECTURE-SPINE, SOLUTION-DESIGN, epics.md, review) — output di dominio, non riusabile.
- Tutto `implementation-artifacts/` (story 1.1-3.3, sprint-status.yaml) — specifico delle feature landing/quiz.
- `specs/spec-remindeer/` (SPEC.md, glossary.md) — glossario e spec sono legati al dominio "concorso farmacia".
- Eventuali import UX (`imports/`, mockup PDF/HTML/screenshot) ovviamente specifici del brand Remindeer.

In sintesi: la "configurazione BMad" qui è sostanzialmente lo stock install 6.10.0 senza customization — il lavoro di setup nel nuovo progetto backoffice si riduce a reinstallare la stessa versione con le stesse risposte di default, poi generare da zero PRD/UX/Architecture/Story per quel dominio.
