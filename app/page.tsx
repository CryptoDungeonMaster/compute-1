import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Benefits } from "@/components/home/Benefits";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <PageShell className="pt-0">
      <Hero />
      <HowItWorks />
      <Benefits />
      <FinalCTA />
    </PageShell>
  );
}
