/**
 * Client-safe shapes returned by lib/data. No `is_correct` anywhere:
 * correctness is only knowable server-side via `checkAnswer`. Mnemonics are
 * not part of `QuizQuestion`: they reach the browser only after grading.
 */
export type QuizOption = {
  id: string;
  text: string;
};

export type QuizMnemonic = {
  text: string | null;
  imageUrl: string | null;
};

export type QuizQuestion = {
  id: string;
  officialNumber: number;
  text: string;
  category: string;
  imageUrl: string | null;
  options: QuizOption[];
};

export type AnswerCheck = {
  isCorrect: boolean;
  correctOptionId: string;
};

export type HomeStat = {
  value: string;
  label: string;
};

/**
 * Hero content of the home page, always complete: every field missing or
 * invalid in the backoffice has already been replaced by its default.
 * `image.remote` tells the hero whether `src` is the static mascot (known
 * size) or a file in the public `page-images` bucket (unknown size).
 */
export type HomeContent = {
  title: string;
  subtitle: string;
  cta: { label: string; note: string };
  stats: HomeStat[];
  image: { src: string; alt: string; remote: boolean };
};
