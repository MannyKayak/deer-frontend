# Addendum — Remindeer Landing + Quiz di Assaggio

Contenuto che approfondisce il PRD ma non ci appartiene direttamente:
razionale di alternative scartate, dettagli tecnici del design system,
discrepanze tra fonti risolte con il PO.

## Inventario fonti di design

- `Deer Landing - Hero Quiz Exploration.dc.html` (+ `support.js`) —
  esplorazione HTML, 3 "turni" con varianti A/B/C, brand "Remindeer".
- `uploads/Design System Farmaconc v2.pdf` — design system 2 pagine, brand
  "Farmaconcorso".
- `uploads/WhatsApp Image 2026-07-31 at 12.19.58.jpeg` — foto di conferma
  della Schermata 1 del PDF, nessuna info aggiuntiva.

## Discrepanze tra fonti — risolte con il PO

| Punto | HTML | PDF | Deciso |
|---|---|---|---|
| Nome brand | Remindeer | Farmaconcorso | **Remindeer** |
| Font titoli | Lexend (CSS reale) | Fredoka (dichiarato) | **Lexend** |
| CTA primaria | "Prova 10 domande gratis" | "Inizia la simulazione gratis" | **"Prova 10 domande gratis"** |

## Varianti hero scartate (HTML, turni 1-2, varianti b/c)

Utilizzabili in futuri A/B test, non per questo slice:

- **Variante b — "Badge & numeri, prova sociale sticker"**: subheadline
  "Non un altro quiz. Un metodo per ricordare le domande ufficiali in pochi
  secondi."; chip sticker ruotati "🦌 3000 domande" / "✅ 0 login" / "⚡ 2
  min"; badge gamification "7/10 finora!" sulla card quiz.
- **Variante c — "Il quiz è l'hero"**: H1 "Le 3000 domande ufficiali,
  trasformate in cose che ricordi."; card quiz con tag "Anteprima" invece
  di "Domanda X di 10"; box mnemotecnica con tag "🔑 Si sblocca dopo la
  risposta" invece di "🔑 Mnemotecnica" — comunica il meccanismo di reveal
  in modo diverso, solo 2 opzioni di risposta mostrate.

## Componenti UI documentati (CSS dell'esplorazione HTML)

- Logo mark: cerchio 26x26px acquamarina, bordo 2px scuro, due "orecchie"
  triangolari (pseudo-elementi ruotati ±25°) — sostituito da placeholder
  finché il logo definitivo non è pronto (vedi PRD OQ-2).
- Bottone CTA primario (`.btn-cta`): Lexend 600 17px, pill (radius 100px),
  ombra piatta 5px 5px 0 senza blur.
- Chip/badge (`.chip`): Inter 600 12px, bordo 2px, pill, ombra piatta 3px
  3px 0.
- Card quiz (`.qcard`): bordo 3px, radius 20px, ombra piatta 7px 7px 0.
- Tag categoria (`.qtag`): uppercase, Inter 600 11px, pill, sfondo
  acquamarina chiarissimo.
- Bottone opzione risposta (`.opt-btn`): full width, bordo 2px grigio
  chiaro, radius 10px; variante `.opt-correct` bordo/sfondo verde, ombra
  piatta verde 5px 5px 0, grassetto.
- Box mnemotecnica (`.mnemo`): sfondo oro chiarissimo, bordo 2px oro,
  radius 10px.
- Breakpoint di riferimento (dalle card di esplorazione): 390px mobile,
  1280px desktop.

## Contenuto del PDF esplicitamente fuori scope per questo slice

Le schermate 3 e 4 del PDF ("Simulazione completata" con 100 domande
cronometrate, ring percentuale, aree deboli; "Dashboard utente" con
saluto personalizzato, streak, countdown, aree da rinforzare) descrivono il
**prodotto pieno post-login**, non la landing pubblica. Confermato dal PO
come fuori scope per questo PRD — vedi §5 Non-Goals del PRD principale.
Riferimento utile per il futuro PRD del prodotto completo.

## Nuance mobile (dall'esplorazione HTML, non promosse a FR)

- Header mobile (variante 3b): al posto della CTA compatta, un chip piccolo
  "Farmacie" — dettaglio di layout, non un requisito funzionale distinto.
- Trust bar: etichette abbreviate su mobile ("quiz gratis" invece di "per il
  quiz gratuito", "login" invece di "login richiesti") — variante tipografica
  responsive, non un contenuto diverso.

## Mascotte

Il design system segnala esplicitamente un placeholder tratteggiato
"mascotte TBD" — componente non definito, non deciso, non incluso in
questo slice.
