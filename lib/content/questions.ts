export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: number;
  category: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  mnemonic: string;
};

/**
 * Placeholder content (OQ-1) — the real 10 questions/mnemonics are
 * supplied by the PO before launch. Versioned in the repo per AD-3,
 * not in Supabase this slice.
 */
export const questions: Question[] = [
  {
    id: 1,
    category: "Farmacologia",
    question:
      "Quale classe di farmaci agisce inibendo la pompa protonica gastrica?",
    options: [
      { id: "a", text: "Inibitori di pompa protonica" },
      { id: "b", text: "Beta-bloccanti" },
      { id: "c", text: "ACE-inibitori" },
      { id: "d", text: "Antistaminici" },
    ],
    correctOptionId: "a",
    mnemonic:
      "\"Pompa chiusa, stomaco in pausa\" — la pompa protonica si blocca, l'acido si ferma.",
  },
  {
    id: 2,
    category: "Legislazione farmaceutica",
    question:
      "In quale registro va annotata la vendita di uno stupefacente di sezione A?",
    options: [
      { id: "a", text: "Registro delle entrate" },
      { id: "b", text: "Registro di carico e scarico stupefacenti" },
      { id: "c", text: "Registro IVA" },
      { id: "d", text: "Nessun registro" },
    ],
    correctOptionId: "b",
    mnemonic:
      "\"Ogni scarico, un segno\" — sezione A entra ed esce solo con traccia scritta.",
  },
  {
    id: 3,
    category: "Chimica farmaceutica",
    question: "Il gruppo funzionale -COOH identifica quale classe?",
    options: [
      { id: "a", text: "Ammine" },
      { id: "b", text: "Alcoli" },
      { id: "c", text: "Acidi carbossilici" },
      { id: "d", text: "Chetoni" },
    ],
    correctOptionId: "c",
    mnemonic: "\"COOH, l'acido dice OH\" — la coda -OH acida chiude il gruppo.",
  },
  {
    id: 4,
    category: "Tossicologia",
    question: "Il paracetamolo in overdose danneggia principalmente:",
    options: [
      { id: "a", text: "Il fegato" },
      { id: "b", text: "I reni" },
      { id: "c", text: "Il cuore" },
      { id: "d", text: "I polmoni" },
    ],
    correctOptionId: "a",
    mnemonic: "\"Para-fegato\" — troppo paracetamolo, il fegato paga il conto.",
  },
  {
    id: 5,
    category: "Farmacologia",
    question: "Gli antibiotici beta-lattamici agiscono su:",
    options: [
      { id: "a", text: "La parete cellulare batterica" },
      { id: "b", text: "La membrana nucleare" },
      { id: "c", text: "I ribosomi virali" },
      { id: "d", text: "Il DNA umano" },
    ],
    correctOptionId: "a",
    mnemonic:
      "\"Lattame che rompe il muro\" — l'anello beta-lattamico buca la parete del batterio.",
  },
  {
    id: 6,
    category: "Legislazione farmaceutica",
    question: "La ricetta bianca ripetibile ha validità massima di:",
    options: [
      { id: "a", text: "6 mesi" },
      { id: "b", text: "10 giorni" },
      { id: "c", text: "30 giorni" },
      { id: "d", text: "1 anno" },
    ],
    correctOptionId: "a",
    mnemonic: "\"Bianca dura una stagione\" — sei mesi, come un cambio di stagione.",
  },
  {
    id: 7,
    category: "Chimica farmaceutica",
    question: "Un composto racemico contiene:",
    options: [
      { id: "a", text: "Un solo enantiomero" },
      { id: "b", text: "Quantità uguali di due enantiomeri" },
      { id: "c", text: "Solo isomeri cis" },
      { id: "d", text: "Nessun centro chirale" },
    ],
    correctOptionId: "b",
    mnemonic: "\"Razza mista, metà e metà\" — racemico è sempre 50/50.",
  },
  {
    id: 8,
    category: "Tossicologia",
    question: "La dose letale 50 (DL50) misura:",
    options: [
      { id: "a", text: "La dose che cura il 50% dei pazienti" },
      { id: "b", text: "La dose letale per il 50% degli animali testati" },
      { id: "c", text: "La metà della dose terapeutica" },
      { id: "d", text: "La dose massima giornaliera consentita" },
    ],
    correctOptionId: "b",
    mnemonic: "\"50 su 100 non ce la fanno\" — DL50 è la soglia a metà gruppo.",
  },
  {
    id: 9,
    category: "Farmacologia",
    question: "Gli ACE-inibitori sono controindicati soprattutto in:",
    options: [
      { id: "a", text: "Gravidanza" },
      { id: "b", text: "Diabete" },
      { id: "c", text: "Asma lieve" },
      { id: "d", text: "Emicrania" },
    ],
    correctOptionId: "a",
    mnemonic:
      "\"ACE dice no alla pancia\" — controindicati in gravidanza per rischio fetale.",
  },
  {
    id: 10,
    category: "Legislazione farmaceutica",
    question: "Il farmacista può sostituire un farmaco di marca con:",
    options: [
      { id: "a", text: "Qualsiasi farmaco simile" },
      { id: "b", text: "Un equivalente generico, salvo diniego del medico" },
      { id: "c", text: "Mai, serve sempre nuova ricetta" },
      { id: "d", text: "Solo su richiesta ASL" },
    ],
    correctOptionId: "b",
    mnemonic:
      "\"Stesso principio, prezzo diverso\" — il generico sostituisce se il medico non lo vieta.",
  },
];
