import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { EmailSignupSection } from "@/components/landing/email-signup";
import { Footer } from "@/components/landing/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";

export default function Home() {
  return (
    <>
      <PageViewTracker event="visit_landing" />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ComparisonSection />
        <EmailSignupSection />
      </main>
      <Footer />
    </>
  );
}
