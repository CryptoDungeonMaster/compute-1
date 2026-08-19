"use client";

import { Panel, Section } from "@/components/ui";

export function TokenView() {
  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Economics</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          One token for work. SOL for settlement.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          TP is the unit of compute. SOL is the settlement rail. Pay with either.
          Workers receive both streams.
        </p>
      </section>

      <Section className="pt-4" id="utility">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Utility",
              copy: "TP dispatches jobs, stakes for fee share, and is earned by verified worker tabs.",
            },
            {
              title: "SOL ↔ TP",
              copy: "Pay in SOL and a slice can convert to TP for incentives, or pay TP directly at a 5% discount.",
            },
            {
              title: "Fee share",
              copy: "A 2.5% protocol fee on each job. 70% to TP stakers, 20% treasury, 10% burned.",
            },
            {
              title: "Alignment",
              copy: "More jobs mean more burns and more staker yield. Workers are paid first.",
            },
          ].map((card) => (
            <Panel key={card.title}>
              <h3 className="font-display text-2xl italic text-ivory">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{card.copy}</p>
            </Panel>
          ))}
        </div>
      </Section>
    </div>
  );
}
