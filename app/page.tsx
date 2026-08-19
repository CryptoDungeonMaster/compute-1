import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Benefits } from "@/components/home/Benefits";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <PageShell className="pt-0">
      <Hero>
        <StatsBar />
      </Hero>
      <HowItWorks />
      <Benefits />
      <ActivityFeed />
      <FinalCTA />
    </PageShell>
  );
}
