"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, Flame, Landmark, Layers } from "lucide-react";
import { GlassCard, Section, SectionHeading } from "@/components/ui";
import { TOKENOMICS } from "@/lib/mock";

export function TokenView() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:pt-24">
        <p className="eyebrow">Economics</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
          One token for work. SOL for settlement.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/60">
          The PF token is the unit of compute on TabPower. SOL is the settlement
          rail. Pay with either — workers always get both streams.
        </p>
      </section>

      <Section className="pt-4" id="utility">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto grid h-64 w-64 place-items-center">
            <div className="absolute inset-6 rounded-full bg-gradient-to-r from-accent-blue to-accent-green opacity-40 blur-3xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              className="relative h-48 w-48 overflow-hidden rounded-full ring-1 ring-white/20 shadow-glow"
            >
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-[#93c5fd] via-[#3B82F6] to-[#1e3a8a]" />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-[#86efac] via-[#22C55E] to-[#14532d]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_40%)]" />
            </motion.div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Layers,
                title: "Utility",
                copy: "PF is spent to dispatch jobs, staked for fee share, and earned by every verified worker tab.",
              },
              {
                icon: ArrowLeftRight,
                title: "SOL ↔ PF",
                copy: "Pay in SOL and the protocol can swap a slice to PF for worker incentives — or pay PF directly at a 5% discount.",
              },
              {
                icon: Landmark,
                title: "Fee share",
                copy: "A 2.5% protocol fee sits on each job. 70% streams to PF stakers, 20% to treasury, 10% is burned.",
              },
              {
                icon: Flame,
                title: "Alignment",
                copy: "More jobs mean more burns and more staker yield. Workers are paid first. Speculation is second.",
              },
            ].map((card) => (
              <GlassCard key={card.title}>
                <card.icon size={18} className="text-accent-blue" />
                <h3 className="mt-4 font-display text-lg text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {card.copy}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <SectionHeading
          align="left"
          eyebrow="Tokenomics"
          title="Simple supply. Clear sinks."
          copy="1,000,000,000 PF. Emissions to workers decay as the mesh matures. No hidden allocations."
        />
        <div className="mt-10 space-y-4">
          {TOKENOMICS.map((row) => (
            <div key={row.label} className="glass rounded-2xl px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white">{row.label}</span>
                <span className="text-white/50">{row.pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${row.pct}%`, background: row.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Worker emissions
            </p>
            <p className="mt-2 font-display text-2xl text-white">40%</p>
            <p className="mt-2 text-sm text-white/50">
              Streamed to tabs that complete verified work. Halves over four
              years.
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Staking APR (est.)
            </p>
            <p className="mt-2 font-display text-2xl text-white">8–14%</p>
            <p className="mt-2 text-sm text-white/50">
              Variable with job volume. Unstake has a 7-day cooldown.
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Job fee
            </p>
            <p className="mt-2 font-display text-2xl text-white">2.5%</p>
            <p className="mt-2 text-sm text-white/50">
              Split 70 / 20 / 10 between stakers, treasury, and burn.
            </p>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
}
