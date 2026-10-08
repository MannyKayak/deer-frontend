import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { QuizFlow } from "@/components/quiz/quiz-flow";
import { checkAnswer, getMnemonics } from "@/lib/data/questions";
import { insertEmailSignup } from "@/lib/data/emailSignup";
import { track } from "@/lib/analytics/track";
import { CONSENT_TEXT_VERSION } from "@/lib/consent";
import type { QuizQuestion } from "@/lib/data/types";

// The real server actions run; only Supabase reads/writes and analytics are mocked.
vi.mock("@/lib/data/questions", () => ({ checkAnswer: vi.fn(), getMnemonics: vi.fn() }));
vi.mock("@/lib/data/emailSignup", () => ({ insertEmailSignup: vi.fn() }));
vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

const checkAnswerMock = vi.mocked(checkAnswer);
const getMnemonicsMock = vi.mocked(getMnemonics);
const insertMock = vi.mocked(insertEmailSignup);
const trackMock = vi.mocked(track);

const Q1 = "11111111-1111-4111-8111-111111111111";
const Q2 = "22222222-2222-4222-8222-222222222222";
const Q1_RIGHT = "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const Q1_WRONG = "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const Q2_RIGHT = "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const Q2_WRONG = "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2";
const CORRECT_BY_QUESTION: Record<string, string> = { [Q1]: Q1_RIGHT, [Q2]: Q2_RIGHT };
const MNEMONIC = "Il paracetamolo PARA il dolore";

const QUESTIONS: QuizQuestion[] = [
  {
    id: Q1,
    officialNumber: 1,
    text: "Quale farmaco è un antipiretico?",
    category: "Farmacologia",
    imageUrl: null,
    options: [
      { id: Q1_RIGHT, text: "Paracetamolo" },
      { id: Q1_WRONG, text: "Amoxicillina" },
    ],
  },
  {
    id: Q2,
    officialNumber: 2,
    text: "Quale vitamina è liposolubile?",
    category: "Chimica",
    imageUrl: null,
    options: [
      { id: Q2_RIGHT, text: "Vitamina D" },
      { id: Q2_WRONG, text: "Vitamina C" },
    ],
  },
];

function mockGrading() {
  checkAnswerMock.mockImplementation(async (questionId, optionId) => ({
    isCorrect: CORRECT_BY_QUESTION[questionId] === optionId,
    correctOptionId: CORRECT_BY_QUESTION[questionId],
  }));
  getMnemonicsMock.mockResolvedValue(
    new Map([
      [Q1, { text: "Mnemotecnica della domanda uno", imageUrl: null }],
      [Q2, { text: MNEMONIC, imageUrl: null }],
    ]),
  );
  insertMock.mockResolvedValue(undefined);
}

/** Answers question 1 correctly and question 2 wrongly, then opens the results. */
async function answerAll(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: "Paracetamolo" }));
  await user.click(screen.getByRole("button", { name: "Avanti" }));
  await user.click(screen.getByRole("button", { name: "Vitamina C" }));
  await user.click(screen.getByRole("button", { name: "Vedi i risultati" }));
}

async function completeQuiz(user: UserEvent) {
  await answerAll(user);
  await screen.findByText("1/2 corrette");
}

describe("quiz flow", () => {
  beforeEach(mockGrading);

  test("shows one question at a time and locks the first pick without revealing anything", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);

    expect(trackMock).toHaveBeenCalledExactlyOnceWith("quiz_started");
    expect(screen.getByText("Domanda 1 di 2")).toBeDefined();
    expect(screen.getByText("Quale farmaco è un antipiretico?")).toBeDefined();
    expect(screen.queryByText("Quale vitamina è liposolubile?")).toBeNull();
    expect(screen.queryByRole("button", { name: "Avanti" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Amoxicillina" }));

    expect(screen.getByRole("button", { name: "Paracetamolo" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Amoxicillina" })).toHaveProperty("disabled", true);
    expect(screen.queryByText(/Corretta|Sbagliata|Mnemotecnica/)).toBeNull();
    expect(checkAnswerMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Avanti" }));

    expect(screen.getByText("Domanda 2 di 2")).toBeDefined();
    expect(screen.getByText("Quale vitamina è liposolubile?")).toBeDefined();
    expect(screen.queryByRole("button", { name: /Avanti|Vedi i risultati/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Vitamina D" }));

    expect(screen.getByRole("button", { name: "Vedi i risultati" })).toBeDefined();
  });

  test("grades on the server and shows score, breakdown and mnemonics only for wrong answers", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);

    await completeQuiz(user);

    expect(checkAnswerMock).toHaveBeenCalledTimes(2);
    expect(checkAnswerMock).toHaveBeenCalledWith(Q1, Q1_RIGHT);
    expect(checkAnswerMock).toHaveBeenCalledWith(Q2, Q2_WRONG);

    const [first, second] = screen.getAllByRole("listitem");
    expect(within(first).getByText("Corretta")).toBeDefined();
    expect(within(first).queryByText("Mnemotecnica della domanda uno")).toBeNull();
    expect(within(first).queryByRole("button")).toBeNull();

    expect(within(second).getByText("Sbagliata")).toBeDefined();
    expect(within(second).getByRole("button", { name: /Vitamina C/ })).toBeDefined();
    expect(within(second).getByRole("button", { name: /Vitamina D/ })).toBeDefined();
    expect(within(second).getByText(MNEMONIC)).toBeDefined();

    expect(trackMock).toHaveBeenCalledWith("quiz_completed", { score: 1, total: 2 });
  });

  test("a grading failure offers a retry that recovers", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    checkAnswerMock.mockRejectedValueOnce(new Error("timeout"));
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);

    await answerAll(user);

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Non riusciamo a correggere il quiz. Riprova.",
    );
    expect(trackMock).not.toHaveBeenCalledWith("quiz_completed", expect.anything());

    await user.click(screen.getByRole("button", { name: "Riprova" }));

    expect(await screen.findByText("1/2 corrette")).toBeDefined();
    consoleError.mockRestore();
  });

  test("Ritenta restarts the same questions from the first one", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.click(screen.getByRole("button", { name: "Ritenta" }));

    expect(screen.getByText("Domanda 1 di 2")).toBeDefined();
    expect(screen.getByRole("button", { name: "Paracetamolo" })).toHaveProperty("disabled", false);
    expect(screen.queryByRole("button", { name: "Avanti" })).toBeNull();
    expect(trackMock.mock.calls.filter(([event]) => event === "quiz_started")).toHaveLength(2);
  });
});

describe("results screen feedback and email capture", () => {
  beforeEach(mockGrading);

  const submitButton = () => screen.getByRole("button", { name: "Invia" });
  const emailInput = () => screen.getByRole("textbox", { name: /email/i });
  const consentCheckbox = () => screen.getByRole("checkbox", { name: /acconsento/i });

  test("nothing can be sent until there is a rating or an email", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    expect(submitButton()).toHaveProperty("disabled", true);

    await user.click(screen.getByRole("radio", { name: "4 stelle su 5" }));

    expect(submitButton()).toHaveProperty("disabled", false);
  });

  test("a rating alone goes to analytics and never to the mailing list", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.click(screen.getByRole("radio", { name: "4 stelle su 5" }));
    await user.click(submitButton());

    expect(await screen.findByText("Grazie per il tuo feedback!")).toBeDefined();
    expect(trackMock).toHaveBeenCalledWith("quiz_feedback", { rating: 4 });
    expect(insertMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalledWith("email_signup_quiz");
  });

  test("email with consent joins the mailing list", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.type(emailInput(), "Mario@Esempio.it");
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByText("Grazie per il tuo feedback!")).toBeDefined();
    expect(insertMock).toHaveBeenCalledExactlyOnceWith({
      email: "mario@esempio.it",
      source: "quiz",
      consentTextVersion: CONSENT_TEXT_VERSION,
    });
    expect(trackMock).toHaveBeenCalledWith("email_signup_quiz");
    expect(trackMock).not.toHaveBeenCalledWith("quiz_feedback", expect.anything());
  });

  test("an email without consent is withheld, the rating still goes through", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.click(screen.getByRole("radio", { name: "5 stelle su 5" }));
    await user.type(emailInput(), "mario@esempio.it");
    await user.click(submitButton());

    expect(await screen.findByText("Grazie per il tuo feedback!")).toBeDefined();
    expect(trackMock).toHaveBeenCalledWith("quiz_feedback", { rating: 5 });
    expect(insertMock).not.toHaveBeenCalled();
    expect(trackMock).not.toHaveBeenCalledWith("email_signup_quiz");
  });

  test("a failed signup shows the error and a retry does not send the rating twice", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    insertMock.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.click(screen.getByRole("radio", { name: "3 stelle su 5" }));
    await user.type(emailInput(), "mario@esempio.it");
    await user.click(consentCheckbox());
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Invio non riuscito. Riprova.");

    await user.click(submitButton());

    expect(await screen.findByText("Grazie per il tuo feedback!")).toBeDefined();
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(trackMock.mock.calls.filter(([event]) => event === "quiz_feedback")).toEqual([
      ["quiz_feedback", { rating: 3 }],
    ]);
    expect(trackMock).toHaveBeenCalledWith("email_signup_quiz");
    consoleError.mockRestore();
  });

  // Same known bug as the landing form: see email-signup-form.test.tsx.
  test.fails("a rejected submit leaves the consent checkbox as the visitor set it", async () => {
    const user = userEvent.setup();
    render(<QuizFlow questions={QUESTIONS} />);
    await completeQuiz(user);

    await user.type(emailInput(), "mario@esempio");
    await user.click(consentCheckbox());
    await user.click(submitButton());
    await screen.findByRole("alert");

    expect(consentCheckbox()).toHaveProperty("checked", true);
  });
});
