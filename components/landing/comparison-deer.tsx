import { QuizCard } from "@/components/ui/quiz-card";
import { MnemoBox } from "@/components/ui/mnemo-box";

export function ComparisonDeer() {
  return (
    <QuizCard className="flex h-full flex-col gap-4">
      <h3 className="font-lexend text-base font-semibold text-text-primary">
        Con Deer
      </h3>
      <MnemoBox>
        Ogni domanda diventa un&apos;immagine o un&apos;associazione che si
        fissa in pochi secondi.
      </MnemoBox>
      <p className="font-lexend text-[17px] font-semibold text-text-primary">
        Non studi di più: ricordi meglio.
      </p>
    </QuizCard>
  );
}
