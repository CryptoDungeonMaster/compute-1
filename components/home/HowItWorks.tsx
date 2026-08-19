"use client";

import { Section } from "@/components/ui";

const STEPS = [
  { n: "Rent", title: "Describe the job, choose a model, and pay its SOL budget into escrow." },
  { n: "Earn", title: "Share a tab, or run the PC worker with your wallet address." },
  { n: "Settle", title: "After the runner completes verified work, SOL becomes available to claim." },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <h2 className="font-display text-4xl font-light italic text-ivory md:text-5xl">
        How it works
      </h2>
      <ol className="mt-12 grid gap-8 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n}>
            <p className="font-display text-xl italic text-gold/80">{step.n}</p>
            <h3 className="mt-3 font-display text-2xl font-light text-ivory">
              {step.title}
            </h3>
          </li>
        ))}
      </ol>
    </Section>
  );
}
