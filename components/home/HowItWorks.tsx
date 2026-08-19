"use client";

import { Section, SectionHeading } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Connect a wallet",
    copy: "Phantom, Solflare, or Backpack. Your address is how you earn and how you pay.",
  },
  {
    n: "02",
    title: "Keep the tab open",
    copy: "Tap Power uses WebGPU in the browser. No binary. No extension required to start.",
  },
  {
    n: "03",
    title: "Share idle compute",
    copy: "When this machine is free, it can join the mesh. Jobs run sandboxed and verify in redundant slices.",
  },
  {
    n: "04",
    title: "Receive PF and SOL",
    copy: "Rewards settle to the connected wallet after verification. Claim when you choose.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading
        eyebrow="Method"
        title="Four gestures. Nothing to install."
        copy="The mesh is open browsers. Connect, leave the tab running, and be paid for cycles that would have idled."
      />
      <ol className="mt-16 divide-y divide-ivory/10 border-y border-ivory/10">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="grid gap-4 py-8 md:grid-cols-[5rem_1fr_1.4fr] md:items-baseline md:gap-10"
          >
            <p className="font-display text-2xl italic text-gold/80">{step.n}</p>
            <h3 className="font-display text-2xl font-light text-ivory">{step.title}</h3>
            <p className="text-sm leading-relaxed text-stone md:text-base">{step.copy}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
