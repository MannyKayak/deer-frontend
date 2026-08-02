import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { QuizPreview } from "@/components/landing/quiz-preview";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { Footer } from "@/components/landing/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { QuizFlow } from "@/components/quiz/quiz-flow";

export default function Home() {
  return (
    <>
      <PageViewTracker event="visit_landing" />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <QuizPreview />
        <section id="quiz" className="px-[22px] py-[44px] xl:px-[56px] xl:py-[80px]">
          <QuizFlow />
        </section>
        <ComparisonSection />
      </main>
      <Footer />
    </>
  );
}
