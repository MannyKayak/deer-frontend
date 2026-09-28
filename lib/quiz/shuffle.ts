/** Fisher–Yates, returns a new array. Options are identified by id, so order is free. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shuffleOptions<Q extends { options: readonly unknown[] }>(questions: readonly Q[]): Q[] {
  return questions.map((question) => ({ ...question, options: shuffle(question.options) }));
}
