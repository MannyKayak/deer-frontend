import { getPreviewQuestion } from "@/lib/content";
import { QuizCard } from "@/components/ui/quiz-card";
import { CategoryTag } from "@/components/ui/category-tag";
import { MnemoBox } from "@/components/ui/mnemo-box";
import { AnswerOption } from "@/components/ui/answer-option";

/**
 * Fully inert. `AnswerOption` became a real `<button>` in Story 2.2 (the
 * real quiz needs it interactive) — pass `disabled` here so the preview
 * options stay unclickable/untabbable, keeping this card's inertness.
 * Shows the mnemo-box pre-revealed as static illustration (see Story 1.4
 * Dev Note on the PRD/UX-DR6 discrepancy — epics.md's AC governs here).
 */
export function QuizPreview() {
  const question = getPreviewQuestion();

  return (
    <section className="px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
      <QuizCard className="mx-auto flex max-w-md flex-col gap-4">
        <CategoryTag>{question.category}</CategoryTag>
        <p className="font-lexend text-[17px] font-semibold leading-[1.4] text-text-primary">
          {question.question}
        </p>
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <AnswerOption key={option.id} disabled>
              {option.text}
            </AnswerOption>
          ))}
        </div>
        <MnemoBox>{question.mnemonic}</MnemoBox>
      </QuizCard>
    </section>
  );
}
