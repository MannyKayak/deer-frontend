import type { Metadata } from "next";
import { connection } from "next/server";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { QuizFlow } from "@/components/quiz/quiz-flow";
import { QuizCard } from "@/components/ui/quiz-card";
import { getFreeQuestions } from "@/lib/data/questions";
import { shuffleOptions } from "@/lib/quiz/shuffle";

export const metadata: Metadata = {
  title: "Quiz gratuito — Remindeer",
};

export default async function QuizPage() {
  // Per request: fresh signed image URLs and a fresh option shuffle.
  await connection();
  const questions = shuffleOptions(await getFreeQuestions());

  return (
    <>
      <Header showCta={false} />
      <main className="flex flex-1 flex-col px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
        {questions.length > 0 ? (
          <QuizFlow questions={questions} />
        ) : (
          <QuizCard className="mx-auto max-w-md">
            <p className="font-sans text-[15px] text-text-primary">
              Nessuna domanda disponibile al momento. Riprova più tardi.
            </p>
          </QuizCard>
        )}
      </main>
      <Footer />
    </>
  );
}
