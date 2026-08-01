# Deer — Project Context (decisioni tecniche e vincoli)

Fonte di verità per tutti i workflow BMAD su questo progetto. Non riaprire
discussione su punti marcati DECISO.

## Prodotto

Deer è piattaforma web (sito responsive, non app nativa) che aiuta neo-laureati
in farmacia a memorizzare le 3000 domande ufficiali del concorso per le sedi
farmaceutiche, tramite mnemotecniche associate alle domande.

Posizionamento: "La strada più veloce per vincere la farmacia."
Tono: diretto e concreto — non "ti aiutiamo a studiare" ma "ti aiutiamo a
ricordare".

## Slice corrente (primo rilascio)

Landing page + quiz-assaggio. PRIMA PARTE del sito reale, stessa repo del
prodotto finale (non prototipo usa-e-getta).

Contenuti:
- Landing: hero, sezione comparativa "perché non è l'ennesimo quiz", anteprima
  quiz, footer minimale.
- Quiz di assaggio: 10 domande, una alla volta, opzioni grandi, SENZA login.
- Fine quiz: risultato + mnemotecniche viste, box feedback (faccine/cuori/
  stelle), campo email OPZIONALE per aggiornamenti sul lancio.

Obiettivo di business: misurare engagement reale prima di costruire il resto.

## Stack tecnico — DECISO

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend/DB/Auth: Supabase (PostgreSQL + auth + API REST/GraphQL
  auto-generate), regione UE (Francoforte)
- Backoffice admin (fase SUCCESSIVA, non ora): Refine sopra Supabase
- Hosting: Vercel
- Analytics: cookieless (Plausible o Umami)
- Pagamenti (fase successiva): Stripe

## Vincoli

- Budget contenuto: ~5-6k€ sviluppo, ~1,5k€/anno ricorrente
- Nessuna infrastruttura complessa
- Proprietà piena di codice e dati al product owner
- Tutti gli account intestati al PO
- DB in UE (requisito GDPR e argomento di vendita)

## Documenti di riferimento (fonte di verità, non reinventare)

- Documenti di Claude Design + file HTML del design system → fonte per la UI
- Roadmap frontend e backoffice → contengono già scomposizione in
  epiche/task con priorità e stime: usarle come base di partenza della
  pianificazione, non ripartire da zero

### Design system in sintesi

Palette OKLCH:
- Primario acquamarina: oklch(74% .13 178)
- Primario scuro ottanio: oklch(46% .09 205)
- Accento oro: oklch(78% .14 85)
- Corretto: oklch(65% .16 145)
- Errato: oklch(62% .20 20)
- Sfondo: oklch(97% .02 90)
- Testo: oklch(22% .02 50)

Tipografia: Lexend (titoli/CTA/numeri) + Inter (testo/domande/opzioni).

Stile: sticker outline, bordi marcati (2px piccoli / 3px contenitori), ombre
piatte "a scatto" senza sfocatura, raggi generosi.

## Scope di questa fase di pianificazione

Sessione corrente: SOLO setup BMAD + avvio pianificazione (PRD). Nessuna
implementazione di codice applicativo, nessuna architettura, nessuna epica —
workflow separati, ognuno con chat fresca (requisito BMAD).

PRD da produrre: centrato sul primo slice (landing + quiz-assaggio), con
Deer-prodotto come visione complessiva sullo sfondo — non PRD dell'intero
prodotto in una volta.
