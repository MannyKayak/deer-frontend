import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { EmailSignupSection } from "@/components/landing/email-signup";
import { Footer } from "@/components/landing/footer";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { getHomeContent } from "@/lib/data/pageContent";

// Safety net for a missed revalidation webhook: the page stays static and is
// regenerated at most once an hour. Must be a literal.
export const revalidate = 3600;

export default async function Home() {
  const content = await getHomeContent();

  return (
    <>
      <PageViewTracker event="visit_landing" />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero content={content} />
        <ComparisonSection />
        <EmailSignupSection />
      </main>
      <Footer />
    </>
  );
}
