"use client";

import { Section, SectionHeading } from "@/components/ui";

const ITEMS = [
  {
    title: "Visible capacity",
    copy: "Live workers report their available adapters and estimated throughput to the network.",
  },
  {
    title: "Two rails",
    copy: "Workers earn SOL after verified completion. Requesters fund work in SOL through escrow.",
  },
  {
    title: "Escrow first",
    copy: "The task budget reaches escrow before scheduling. Worker credit is written only after completion.",
  },
  {
    title: "Parallel when useful",
    copy: "Longer workloads can recruit up to three available workers and divide settlement between participants.",
  },
];

export function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Principles"
        title="Quiet rails for idle silicon."
        copy="Built as a product, not a faucet. Clear pricing, verified output, wallet native settlement."
      />
      <div className="mt-16 grid border-y border-ivory/10 md:grid-cols-2">
        {ITEMS.map((item, index) => (
          <article key={item.title} className={`py-8 md:p-10 ${index % 2 ? "md:border-l md:border-ivory/10" : ""} ${index > 1 ? "border-t border-ivory/10" : index === 1 ? "border-t border-ivory/10 md:border-t-0" : ""}`}>
            <p className="font-mono text-[9px] tracking-[.18em] text-gold">0{index + 1}</p>
            <h3 className="mt-3 text-xl font-medium text-ivory">
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
