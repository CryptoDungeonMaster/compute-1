"use client";

import { Panel, Section, SectionHeading } from "@/components/ui";
import { TOKENOMICS } from "@/lib/tokenomics";

export function TokenView() {
  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Economics</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          One token for work. SOL for settlement.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          PF is the unit of compute. SOL is the settlement rail. Pay with either.
          Workers receive both streams.
        </p>
      </section>

      <Section className="pt-4" id="utility">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Utility",
              copy: "PF dispatches jobs, stakes for fee share, and is earned by verified worker tabs.",
            },
            {
              title: "SOL ↔ PF",
              copy: "Pay in SOL and a slice can convert to PF for incentives — or pay PF directly at a 5% discount.",
            },
            {
              title: "Fee share",
              copy: "A 2.5% protocol fee on each job. 70% to PF stakers, 20% treasury, 10% burned.",
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

      <Section>
        <SectionHeading
          eyebrow="Allocation"
          title="Simple supply. Clear sinks."
          copy="1,000,000,000 PF. Worker emissions decay as the mesh matures."
        />
        <div className="mt-12 space-y-6">
          {TOKENOMICS.map((row) => (
            <div key={row.label} className="border-b border-ivory/10 pb-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-ivory">{row.label}</span>
                <span className="font-display text-xl italic text-gold">{row.pct}%</span>
              </div>
              <div className="h-px w-full bg-ivory/10">
                <div className="h-px bg-gold" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Panel>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone">
              Worker emissions
            </p>
            <p className="mt-3 font-display text-3xl italic text-ivory">40%</p>
            <p className="mt-3 text-sm text-stone">
              Streamed to tabs that complete verified work. Halves over four years.
            </p>
          </Panel>
          <Panel>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Unstake</p>
            <p className="mt-3 font-display text-3xl italic text-ivory">7 days</p>
            <p className="mt-3 text-sm text-stone">
              Cooldown on PF stake withdrawals. Yield follows job volume.
            </p>
          </Panel>
          <Panel>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Job fee</p>
            <p className="mt-3 font-display text-3xl italic text-ivory">2.5%</p>
            <p className="mt-3 text-sm text-stone">
              Split 70 / 20 / 10 between stakers, treasury, and burn.
            </p>
          </Panel>
        </div>
      </Section>
    </div>
  );
}
