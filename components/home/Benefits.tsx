"use client";

import { Section, SectionHeading } from "@/components/ui";

const ITEMS = [
  {
    title: "Nothing to install",
    copy: "Jobs compile to WebGPU. If the tab can paint a canvas, it can contribute.",
  },
  {
    title: "Two rails",
    copy: "Workers earn PF and SOL. Requesters may pay with either. PF carries a protocol discount.",
  },
  {
    title: "Escrow first",
    copy: "Budget locks on Solana until hashed results agree. Unused funds return. No prepaid trust.",
  },
  {
    title: "Device-aware rates",
    copy: "Capable adapters price higher. Lighter machines take the long tail.",
  },
];

export function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Principles"
        title="Quiet rails for idle silicon."
        copy="Built as a product, not a faucet. Clear pricing, verified output, wallet-native settlement."
      />
      <div className="mt-16 grid gap-px bg-ivory/10 md:grid-cols-2">
        {ITEMS.map((item) => (
          <article key={item.title} className="bg-ink p-8 md:p-10">
            <h3 className="font-display text-2xl font-light italic text-ivory">
              {item.title}
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
              {item.copy}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}
