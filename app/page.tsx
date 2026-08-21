import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Benefits } from "@/components/home/Benefits";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Market } from "@/components/home/Market";
import { Mesh } from "@/components/home/Mesh";

export default function HomePage() {
  return (
    <PageShell className="pt-0">
      <Hero />
      <Market />
      <HowItWorks />
      <Mesh />
      <Benefits />
      <FinalCTA />
    </PageShell>
  );
}
