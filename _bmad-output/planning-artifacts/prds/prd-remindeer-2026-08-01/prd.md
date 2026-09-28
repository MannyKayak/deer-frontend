---
title: Remindeer — Landing + Quiz di Assaggio
status: final
created: 2026-08-01
updated: 2026-08-01
---

# PRD: Remindeer — Landing + Quiz di Assaggio

_Working title — "Remindeer" confermato come nome prodotto per questo slice._

## 0. Scopo del documento

Questo PRD guida la costruzione del **primo slice pubblico** di Remindeer: una
landing page con quiz-assaggio senza login, pensata per misurare
l'engagement reale prima di investire nel prodotto completo (le 3000
domande, l'area personale, i pagamenti). È rivolto a chi implementerà questo
slice (sviluppo, design) e a chi lo validerà a valle (UX, architettura,
epiche/storie). Si appoggia su `_bmad-output/project-context.md` (decisioni
tecniche e vincoli, non ripetute qui) e sui file di design forniti dal
cliente (vedi `addendum.md` per l'inventario completo e le discrepanze
rilevate tra le fonti). Struttura: vocabolario ancorato al Glossario,
funzionalità raggruppate con FR numerati globalmente, assunzioni taggate
inline e indicizzate in fondo.

## 1. Vision

Remindeer aiuta i neo-laureati in farmacia a superare il concorso pubblico per le
sedi farmaceutiche, l'esame che assegna il diritto a gestire una farmacia.
Il problema non è l'accesso alle domande — le 3000 domande ufficiali sono
pubbliche — è **ricordarle** il giorno dell'esame. Remindeer risolve questo con
mnemotecniche associate a ogni domanda: non un quiz in più, ma un metodo per
fissare in memoria in pochi secondi ciò che altrimenti richiede riletture
infinite. Posizionamento: "La strada più veloce per vincere la farmacia."

Questo slice non è il prodotto — è la sua prima porta d'ingresso pubblica.
Una landing che spiega la differenza (metodo tradizionale vs mnemotecnica) e
un quiz di 10 domande, senza registrazione, che fa _provare_ la
mnemotecnica invece di descriverla. Se chi arriva completa il quiz, lascia
un feedback e (facoltativamente) la propria email, abbiamo un segnale reale
di validazione prima di costruire il resto.

## 2. Target utente

### 2.1 Jobs To Be Done

- Verificare in 2 minuti, senza impegno, se "questo metodo funziona per me"
  prima di fidarmi di una piattaforma nuova (funzionale + emotivo: scetticismo
  verso l'ennesimo quiz/app di studio).
- Capire concretamente cosa significa "mnemotecnica applicata al concorso",
  non solo leggerne la promessa in un claim di marketing.
- Lasciare un contatto solo se il prodotto mi ha convinto — non prima.

### 2.2 Non-Users (v1)

- Chi cerca già un simulatore completo (100 domande cronometrate, aree
  deboli, dashboard con streak): quello è il prodotto pieno, non questo slice
  — vedi §6 Non-Goals.
- Chi richiede login per ragioni proprie (tracciamento personale, salvataggio
  progressi cross-device): non supportato in questo slice.

### 2.3 Key User Journeys

- **UJ-1. Marta prova il metodo prima di fidarsi.**
  - **Persona + contesto:** Marta, neo-laureata in farmacia, ha già provato
    app di quiz generiche e le trova noiose; scettica su "l'ennesimo quiz".
  - **Entry state:** non autenticata, arriva sulla landing da un link
    condiviso o da un annuncio, su mobile.
  - **Percorso:** legge l'hero e la sezione comparativa ("perché non è
    l'ennesimo quiz") → clicca "Prova 10 domande gratis" → risponde alla
    prima domanda → vede la mnemotecnica sbloccarsi dopo la risposta →
    ripete per le 10 domande.
  - **Climax:** alla decima domanda arriva alla schermata finale: risultato,
    riepilogo delle mnemotecniche viste, capisce di aver _ricordato_ qualcosa
    in 2 minuti senza sforzo percepito.
  - **Risoluzione:** lascia un feedback (rating a stelle) e,
    facoltativamente, la propria email per essere avvisata al lancio.
  - **Edge case:** se abbandona a metà quiz (es. chiude il tab alla domanda
    5), nessun dato viene salvato lato server — il progresso non sopravvive
    a un refresh (vedi FR-7).

- **UJ-2. Marta valuta prima di impegnarsi, da desktop, in pausa pranzo.**
  - **Persona + contesto:** stessa Marta, ma questa volta più diffidente:
    legge tutta la landing prima di cliccare qualunque cosa.
  - **Entry state:** non autenticata, desktop, arriva da un post social.
  - **Percorso:** scorre hero → sezione comparativa (metodo tradizionale vs
    Remindeer) → anteprima quiz in pagina (senza ancora cliccare) → decide di
    cliccare "Prova 10 domande gratis" solo dopo aver letto la comparativa.
  - **Climax:** la sezione comparativa le convince che la differenza è reale
    ("non studi di più: ricordi meglio"), non solo un claim.
  - **Risoluzione:** entra nel quiz con aspettativa corretta di cosa
    otterrà — nessuna sorpresa a metà flusso.

## 3. Glossario

- **Remindeer** — nome del prodotto/brand per questo slice (confermato dal PO;
  il PDF di design system usava "Farmaconcorso" come nome alternativo, non
  usato in questo PRD — vedi `addendum.md`).
- **Mnemotecnica** — associazione mnemonica (immagine, gioco di parole,
  associazione) collegata a una singola domanda ufficiale, mostrata dopo che
  l'utente ha risposto.
- **Quiz di assaggio** — il flusso di 10 domande, senza login, oggetto di
  questo slice. Distinto dalla "simulazione" (100 domande cronometrate) del
  prodotto futuro, fuori scope qui.
- **Domanda ufficiale** — una delle 3000 domande del concorso pubblico per
  sedi farmaceutiche. In questo slice ne vengono mostrate 10, come
  contenuto placeholder (vedi §7, §9).
- **Sede farmaceutica** — la farmacia il cui diritto di gestione è assegnato
  tramite il concorso pubblico oggetto di preparazione.
- **Schermata finale** — la schermata mostrata dopo la decima domanda:
  risultato, riepilogo mnemotecniche, box feedback, campo email opzionale.
- **Box feedback** — componente di raccolta reazione rapida (rating a
  stelle, 5 livelli) sulla schermata finale. *(Il brief iniziale del PO
  parlava genericamente di "faccine/cuori/stelle"; ristretto a sole stelle
  in questa sessione — vedi memlog.)*
- **Opt-in email** — campo email opzionale sulla schermata finale, per
  aggiornamenti sul lancio del prodotto completo. Non un account. Distinto
  dalla sezione email della landing (FR-13, aggiunta 2026-09-27) — le due
  raccolte restano indipendenti.
- **PO** — Product Owner, proprietario di codice, dati e account.

## 4. Funzionalità

**Estetica e tono:** stile "sticker outline" — bordi marcati (2px elementi
piccoli, 3px contenitori), ombre piatte "a scatto" senza sfocatura, raggi
generosi, badge/chip talvolta leggermente ruotati per un tocco giocoso.
Palette OKLCH e tipografia Lexend+Inter come da `project-context.md`. Tono
di copy diretto e orientato al risultato, mai "ti aiutiamo a studiare" ma
"ti aiutiamo a ricordare" — la contrapposizione esplicita
metodo-tradizionale-vs-mnemotecnica è il pattern retorico chiave, ripetuto
in ogni superficie (hero, sezione comparativa). Dettagli component-level
completi in `addendum.md`.

### 4.1 Landing page

**Descrizione:** pagina pubblica, responsive, mobile-first (breakpoint di
riferimento: 390px mobile / 1280px desktop, coerenti con le esplorazioni di
design). Composta da: header con logo+wordmark Remindeer (logo definitivo in
produzione — placeholder confermato: solo scritta/wordmark testuale finché
non è pronto, vedi OQ-2) e CTA compatta; hero testuale senza immagine
prodotto, con headline, subheadline, CTA primaria, microcopy "Nessuna
registrazione richiesta", trust bar a 3 statistiche; sezione comparativa a
due colonne ("Metodo tradizionale" vs "Con Remindeer"); sezione "lascia la tua
mail" (FR-13); footer minimale con link Privacy/Termini. Copy esatto preso
dal file HTML di esplorazione (variante "Essenziale", 3a/3b) — vedi
`addendum.md` per le varianti alternative scartate.

**Revisione 2026-09-27:** l'anteprima quiz in pagina (ex FR-4) è stata
ritirata — il quiz vive ora su una pagina dedicata (`/quiz`), non più
incorporato/anticipato in home. Vedi `sprint-change-proposal-2026-09-27.md`.

**Requisiti funzionali:**

#### FR-1: Hero con CTA verso il quiz

Il visitatore può vedere hero (headline, subheadline, CTA, microcopy,
trust bar) e avviare il quiz con un tap/click. Realizza UJ-1, UJ-2.

**Conseguenze (testabili):**

- Eyebrow/tag sopra la headline: "Concorso pubblico farmacie".
- Headline: "La strada più veloce per vincere la farmacia."
- Subheadline: "3000 domande ufficiali. Le ricordi con la mnemotecnica, non
  le rileggi all'infinito."
- CTA primaria: "Prova 10 domande gratis" (con freccia nell'hero, senza
  freccia nell'header sticky).
- Microcopy sotto CTA: "Nessuna registrazione richiesta".
- Trust bar mostra 3 statistiche: "3000 domande ufficiali", "2 min per il
  quiz gratuito", "0 login richiesti".
- Click sulla CTA porta all'inizio del quiz (domanda 1/10) senza step
  intermedi (niente form, niente conferma).
- Header sticky: resta visibile durante lo scroll, con CTA compatta
  sempre raggiungibile.

#### FR-2: Sezione comparativa

Il visitatore può leggere la contrapposizione "metodo tradizionale vs Remindeer"
prima di decidere se avviare il quiz. Realizza UJ-2.

**Conseguenze (testabili):**

- Titolo: "Perché non è l'ennesimo quiz".
- Sottotitolo: "La differenza non è quante domande vedi, ma se te le
  ricordi il giorno dell'esame."
- Colonna sinistra ("Metodo tradizionale"): "Un muro di 3000 domande
  uguali, da rileggere all'infinito sperando che restino in testa."
- Colonna destra ("Con Remindeer"): box mnemotecnica con testo "Ogni domanda
  diventa un'immagine o un'associazione che si fissa in pochi secondi." e
  chiusura "Non studi di più: ricordi meglio."
- Layout single-column su mobile, due colonne affiancate da desktop in su.

#### FR-3: Footer minimale

Il visitatore può vedere il footer con nome prodotto e link legali.

**Conseguenze (testabili):**

- Testo: "Remindeer — mnemotecniche per il concorso farmacie".
- Link "Privacy" e "Termini" presenti (contenuto delle pagine collegate:
  vedi Open Question OQ-3 — non ancora scritto).

#### FR-4: Anteprima quiz in pagina — **RITIRATO (2026-09-27)**

~~Il visitatore può vedere una card con una domanda campione, senza doverla
avviare, prima di decidere se cliccare la CTA.~~ Ritirato: il quiz si
sposta su pagina dedicata (`/quiz`), la landing non anticipa più il
contenuto del quiz. Vedi `sprint-change-proposal-2026-09-27.md`. La card
statica e il relativo accessor `getPreviewQuestion()` vanno rimossi in
implementazione.

#### FR-13: Sezione "lascia la tua mail" in landing — **NUOVO (2026-09-27)**

Il visitatore può lasciare la propria email per aggiornamenti sul lancio
direttamente dalla landing, senza dover completare il quiz. Distinta da
FR-10 (email opzionale a fine quiz) — le due restano indipendenti, non si
uniscono.

**Conseguenze (testabili):**
- Sezione dedicata tra la sezione comparativa e il footer.
- Campo email + consenso esplicito (stessa logica di consenso GDPR di
  FR-10, copy propria).
- Genera un evento distinto da quello di fine quiz (nome definitivo a
  carico di implementazione, es. `email_signup_landing`).
- Nessun impatto su FR-9/FR-10/FR-11 (box feedback e email di fine quiz
  restano invariati).

**Note:** _(vedi `addendum.md` per le 3 varianti hero alternative
esplorate — badge sticker "prova sociale" e "quiz come hero" — scartate a
favore della variante Essenziale/3a-3b per questo slice, ma riutilizzabili
in futuri A/B test)._

### 4.2 Quiz di assaggio

**Descrizione:** flusso di 10 domande ufficiali (contenuto placeholder in
questa fase, vedi §7/§9), una alla volta, senza login. Ogni domanda mostra
un tag categoria, un indicatore di progresso ("Domanda N di 10"), il testo
della domanda, opzioni di risposta grandi (bottoni full-width, stack
verticale). Dopo la risposta, la mnemotecnica associata si sblocca
(risposta corretta evidenziata visivamente). Realizza UJ-1.

**Requisiti funzionali:**

#### FR-5: Presentazione domanda singola

L'utente può vedere una domanda alla volta con le sue opzioni di risposta.

**Conseguenze (testabili):**

- Card domanda mostra: tag categoria (es. "Farmacologia"), indicatore
  "Domanda N di 10", testo domanda, 3-4 opzioni come bottoni full-width.
- Nessuna domanda successiva visibile finché non si è risposto alla
  corrente.
- Nessun login o dato personale richiesto per procedere.

#### FR-6: Selezione risposta senza feedback immediato — **REVISIONATO (2026-09-27)**

L'utente può selezionare una risposta per ciascuna domanda; la risposta si
blocca subito e non è più modificabile. Nessuna correttezza o mnemotecnica
viene mostrata durante il quiz — tutto è rimandato alla schermata finale
(vedi FR-8, revisionato).

**Conseguenze (testabili):**

- Al tap su un'opzione, questa si blocca in stato "selezionata" (bordo/
  sfondo primario neutro) — nessun segnale di corretto/errato, nessuna
  mnemotecnica mostrata a questo punto.
- L'utente non può più cambiare risposta una volta selezionata.
- L'utente avanza alla domanda successiva con un tap esplicito su un
  bottone "Avanti" — non auto-advance. Il bottone non rivela nulla, serve
  solo a procedere in modo deliberato.
- ~~Evidenziazione risposta corretta indipendente dal tap~~ e ~~box
  mnemotecnica durante il quiz~~ sono rimossi da questo FR e spostati in
  FR-8 (schermata finale).

#### FR-7: Progresso non persistito

Il sistema non salva lato server le risposte intermedie durante il quiz.

**Conseguenze (testabili):**

- Un refresh di pagina durante il quiz riporta l'utente alla domanda 1.
- Nessuna tabella/record creato in Supabase per le singole risposte
  intermedie (solo l'evento di completamento finale, vedi FR-10).

**Out of Scope:**

- Salvataggio progressivo cross-sessione: appartiene al prodotto con login,
  fuori scope qui.

### 4.3 Schermata finale

**Descrizione:** dopo la decima domanda, l'utente vede risultato, riepilogo
delle mnemotecniche incontrate, un box feedback rapido e un campo email
opzionale. Realizza UJ-1.

**Requisiti funzionali:**

#### FR-8: Risultato e riepilogo per domanda — **REVISIONATO (2026-09-27)**

L'utente può vedere quante risposte corrette ha dato e, per ogni domanda,
se l'ha indovinata o no — con la mnemotecnica mostrata solo per le
risposte sbagliate.

**Conseguenze (testabili):**

- Mostra punteggio (es. "7/10 corrette").
- Elenca tutte e 10 le domande con esito: corretta → solo segno di spunta,
  nessuna mnemotecnica; sbagliata → mnemotecnica associata mostrata (tag
  "🔑 Mnemotecnica").
- CTA "Ritenta": riavvia le stesse 10 domande dall'inizio (stessa sessione,
  stato azzerato). Un nuovo completamento genera un nuovo evento FR-11
  indipendente.

#### FR-9: Box feedback

L'utente può lasciare una reazione rapida sull'esperienza.

**Conseguenze (testabili):**

- Componente rating a stelle (5 livelli).
- La selezione è facoltativa ma incoraggiata (non un gate per vedere il
  resto della schermata).
- L'evento feedback viene inviato al sistema anche se l'utente non compila
  l'email (i due campi sono indipendenti).

#### FR-10: Campo email opzionale

L'utente può lasciare la propria email per aggiornamenti sul lancio, senza
che sia richiesto per completare l'esperienza.

**Conseguenze (testabili):**

- Campo email chiaramente marcato come opzionale.
- Nessuna validazione bloccante oltre al formato email valido.
- Invio email (se presente) e reazione feedback (se presente) generano un
  singolo evento "quiz completato" salvato lato backend (vedi FR-11).
- Copy di consenso esplicito e minimale accanto al campo (necessario per
  GDPR, dato che i dati sono raccolti nel dominio UE) —
  `[ASSUMPTION: testo di consenso non ancora fornito da nessuna fonte,
serve copy legale — vedi OQ-3]`.

### 4.4 Raccolta dati minima ed eventi

**Descrizione:** questo slice non ha backend applicativo complesso (niente
auth, niente le 3000 domande in DB) ma usa comunque Supabase — già deciso
come stack — con perimetro ridotto: solo l'evento di completamento quiz
(punteggio, feedback, email opzionale, timestamp) e gli eventi analytics
cookieless. Realizza tracciamento per §8 Metriche di successo.

**Requisiti funzionali:**

#### FR-11: Evento "quiz completato"

Il sistema può registrare un evento per ogni quiz completato.

**Conseguenze (testabili):**

- Record salvato in Supabase (regione UE) contenente: punteggio,
  reazione feedback (se presente), email (se presente), timestamp.
- Nessun record creato per quiz abbandonati a metà (vedi FR-7).
- Nessuna tabella per contenuto domande/mnemotecniche in questa fase — il
  contenuto delle 10 domande vive come dato statico versionato nel repo,
  non in DB (confermato col PO; se e quando spostarlo in DB è decisione
  futura, non di questo slice).

#### FR-12: Analytics cookieless

Il sistema può tracciare eventi di navigazione ed engagement senza cookie
banner.

**Conseguenze (testabili):**

- Strumento cookieless (Plausible o Umami, scelta finale in Open Question
  OQ-4) traccia: visita landing, avvio quiz, completamento quiz.
- Tracciamento della domanda di abbandono è best-effort (dipende da cosa lo
  strumento scelto riesce a rilevare lato client): se non disponibile, il
  sistema funziona comunque — non è un requisito bloccante, solo un dato in
  più se ottenibile.
- Nessun banner di consenso cookie mostrato (requisito, non solo
  conseguenza di scelta tecnica).

## 5. Requisiti trasversali (NFR)

- **NFR-1 (Accessibilità):** la codifica corretto/errato non si basa sul
  solo colore — sempre affiancata da icona o testo, per utenti con
  daltonismo. Contrasto testo/sfondo conforme a WCAG 2.1 AA sui colori del
  design system (palette OKLCH di `project-context.md`).
- **NFR-2 (Performance):** mobile-first, dato che l'ingresso principale è
  da smartphone (breakpoint di riferimento 390px). Nessun budget
  quantitativo di performance fissato in questa fase
  `[ASSUMPTION: nessuna fonte fornisce target Lighthouse/Core Web Vitals
  specifici — se servono, vanno definiti in fase di architettura]`.
- **NFR-3 (Privacy):** dati (email opzionale, evento feedback) salvati in
  Supabase regione UE (Francoforte), per vincolo GDPR di
  `project-context.md`. Nessun dato raccolto senza consenso esplicito (vedi
  FR-10, OQ-3).

## 6. Non-Goals (espliciti)

- Nessun login, account utente o area personale in questo slice.
- Nessuna delle 3000 domande complete in DB — solo 10 placeholder.
- Nessuna simulazione cronometrata da 100 domande, nessuna dashboard con
  streak/countdown/aree deboli (quelle schermate esistono nel PDF di design
  system ma appartengono al prodotto pieno, non a questo slice).
- Nessun backoffice/admin per gestire contenuti (Refine su Supabase è fase
  successiva, per project-context.md).
- Nessun pagamento/Stripe in questo slice.
- Nessuna persistenza di progresso quiz cross-sessione o cross-device.
- Nessuna mascotte (segnalata come "TBD" nel design system, non decisa).

## 7. Perimetro MVP

### 7.1 In Scope

- Landing: hero (testuale, senza immagine), sezione comparativa, sezione
  email signup (FR-13), footer. **(2026-09-27: anteprima quiz rimossa,
  sezione email aggiunta.)**
- Quiz di assaggio: 10 domande placeholder, una alla volta, senza login, su
  pagina dedicata (`/quiz`); selezione bloccata, nessun feedback durante
  il quiz.
- Schermata finale: risultato, riepilogo per-domanda (corretto/sbagliato,
  mnemotecnica solo sulle sbagliate), CTA "Ritenta", box feedback, campo
  email opzionale (distinto da FR-13).
- Salvataggio evento di completamento (Supabase, perimetro minimo) +
  analytics cookieless.
- Design system Remindeer: palette OKLCH, Lexend+Inter, stile sticker outline.

### 7.2 Out of Scope per MVP

- Contenuto reale delle 10 domande/mnemotecniche — placeholder ora,
  sostituito dal PO prima del lancio (vedi OQ-1).
- Logo definitivo — placeholder, in produzione (vedi OQ-2).
- Pagine Privacy/Termini con testo legale reale (vedi OQ-3).
- Scelta finale tool analytics tra Plausible/Umami (vedi OQ-4).
- Tutto quanto in §6 Non-Goals.

## 8. Metriche di successo

**Primarie**

- **SM-1**: Tasso di completamento quiz — % di chi avvia la domanda 1 che
  raggiunge la schermata finale. Target indicativo ≥50%. Valida FR-5, FR-6,
  FR-7.
- **SM-2**: Tasso di opt-in email — % di chi completa il quiz che lascia
  l'email. Target indicativo ≥20%. Valida FR-10.

**Secondarie**

- **SM-3**: Tempo medio di completamento quiz — conferma o smentisce la
  promessa di copy "2 minuti". Valida FR-5, FR-6.
- **SM-4**: Distribuzione reazioni feedback — informativa, nessun target
  numerico, usata per leggere il sentiment. Valida FR-9.

**Metriche di controguardia (da non ottimizzare)**

- **SM-C1**: Qualità percepita della mnemotecnica (via distribuzione
  feedback, SM-4) non deve peggiorare mentre si ottimizza SM-1 — un
  completamento alto ottenuto rendendo le domande banali o rimuovendo la
  mnemotecnica sarebbe un falso segnale di validazione. Contrappone SM-1.

## 9. Domande aperte

1. **OQ-1**: Chi fornisce il contenuto reale delle 10 domande + mnemotecniche
   e quando sostituisce il placeholder di questa fase?
2. **OQ-2**: Logo definitivo Remindeer — in produzione, quando disponibile?
3. **OQ-3**: Testo legale per pagine Privacy/Termini e copy di consenso
   email — non ancora fatto. Iubenda candidato (genera Privacy/Termini +
   gestione consenso, costo contenuto, compatibile col budget), da
   confermare/attivare dal PO.
4. **OQ-4**: Plausible o Umami per analytics cookieless — quale, chi lo
   configura e chi ne è account owner (deve essere il PO, per vincolo di
   project-context.md)?
5. **OQ-5**: Progetto Supabase (regione Francoforte) già creato o da
   provisionare in questa fase? Chi ne detiene le credenziali/l'account
   owner (deve essere il PO)?
6. **OQ-6**: Dominio non ancora deciso — impatta setup Vercel/DNS, non
   blocca lo sviluppo ma va risolto prima del lancio pubblico.

## 10. Indice delle assunzioni

Le assunzioni su logo placeholder, avanzamento via bottone "Conferma" e
contenuto domande statico sono state confermate col PO durante questa
sessione. Restano aperte:

- §4.3 (FR-10) — Serve copy di consenso GDPR esplicito accanto al campo
  email, testo non ancora fornito (candidato Iubenda, vedi OQ-3).
- §5 (NFR-2) — Nessun target quantitativo di performance
  (Lighthouse/Core Web Vitals) fissato in questa fase; da definire in
  architettura se necessario.
