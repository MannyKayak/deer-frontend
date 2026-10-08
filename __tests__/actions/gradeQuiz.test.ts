import { describe, expect, test, vi } from "vitest";
import { gradeQuiz } from "@/lib/actions/gradeQuiz";
import { checkAnswer, getMnemonics } from "@/lib/data/questions";

vi.mock("@/lib/data/questions", () => ({ checkAnswer: vi.fn(), getMnemonics: vi.fn() }));

const checkAnswerMock = vi.mocked(checkAnswer);
const getMnemonicsMock = vi.mocked(getMnemonics);

const Q1 = "11111111-1111-4111-8111-111111111111";
const Q2 = "22222222-2222-4222-8222-222222222222";
const Q1_RIGHT = "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const Q2_RIGHT = "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const Q2_WRONG = "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2";

function uuid(n: number) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

describe("gradeQuiz", () => {
  test("grades every answer server-side and attaches the mnemonics", async () => {
    checkAnswerMock.mockImplementation(async (questionId, optionId) =>
      questionId === Q1
        ? { isCorrect: optionId === Q1_RIGHT, correctOptionId: Q1_RIGHT }
        : { isCorrect: optionId === Q2_RIGHT, correctOptionId: Q2_RIGHT },
    );
    getMnemonicsMock.mockResolvedValue(new Map([[Q2, { text: "Ricorda così", imageUrl: null }]]));

    const result = await gradeQuiz([
      { questionId: Q1, optionId: Q1_RIGHT },
      { questionId: Q2, optionId: Q2_WRONG },
    ]);

    expect(result).toEqual({
      ok: true,
      results: [
        { questionId: Q1, isCorrect: true, correctOptionId: Q1_RIGHT, mnemonic: null },
        {
          questionId: Q2,
          isCorrect: false,
          correctOptionId: Q2_RIGHT,
          mnemonic: { text: "Ricorda così", imageUrl: null },
        },
      ],
    });
    expect(getMnemonicsMock).toHaveBeenCalledExactlyOnceWith([Q1, Q2]);
  });

  test("counts a pair rejected by check_answer as wrong", async () => {
    checkAnswerMock.mockResolvedValue(null);
    getMnemonicsMock.mockResolvedValue(new Map());

    const result = await gradeQuiz([{ questionId: Q1, optionId: Q2_WRONG }]);

    expect(result).toEqual({
      ok: true,
      results: [{ questionId: Q1, isCorrect: false, correctOptionId: null, mnemonic: null }],
    });
  });

  test.each<[string, { questionId: string; optionId: string }[]]>([
    ["no answers", []],
    ["a non-uuid question id", [{ questionId: "1", optionId: Q1_RIGHT }]],
    ["a non-uuid option id", [{ questionId: Q1, optionId: "a" }]],
    [
      "the same question answered twice",
      [
        { questionId: Q1, optionId: Q1_RIGHT },
        { questionId: Q1, optionId: Q2_WRONG },
      ],
    ],
    ["more than 200 answers", Array.from({ length: 201 }, (_, i) => ({ questionId: uuid(i), optionId: Q1_RIGHT }))],
  ])("rejects %s without touching the database", async (_label, answers) => {
    const result = await gradeQuiz(answers);

    expect(result).toEqual({ ok: false, error: "Risposte non valide." });
    expect(checkAnswerMock).not.toHaveBeenCalled();
    expect(getMnemonicsMock).not.toHaveBeenCalled();
  });

  test("returns a generic error instead of throwing when the check fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    checkAnswerMock.mockRejectedValue(new Error("connection refused"));
    getMnemonicsMock.mockResolvedValue(new Map());

    const result = await gradeQuiz([{ questionId: Q1, optionId: Q1_RIGHT }]);

    expect(result).toEqual({ ok: false, error: "Non riusciamo a correggere il quiz. Riprova." });
    consoleError.mockRestore();
  });
});
