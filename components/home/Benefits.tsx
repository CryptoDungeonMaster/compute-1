"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Gauge,
  Globe,
  LockKeyhole,
  Sparkles,
  Timer,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";

const BENEFITS = [
  {
    title: "Nothing to install",
    copy: "Jobs compile down to WebGPU. If the tab can render a canvas, it can earn.",
    icon: Sparkles,
  },
  {
    title: "Dual rewards",
    copy: "Workers earn the PF token and a SOL stream. Requesters can pay with either.",
    icon: BadgeCheck,
  },
  {
    title: "Escrow by default",
    copy: "Budget locks on Solana until results verify. No prepaid trust, no chargebacks.",
    icon: LockKeyhole,
  },
  {
    title: "Device-aware pricing",
    copy: "High-VRAM tabs price higher. Economy workers pick up the long tail.",
    icon: Gauge,
  },
  {
    title: "Global matching",
    copy: "The mesh routes work to the nearest capable tab so latency stays honest.",
    icon: Globe,
  },
  {
    title: "Minutes, not queues",
    copy: "Burst inference and tile renders start as soon as a worker heartbeats.",
    icon: Timer,
  },
];

export function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why TabPower"
        title="Premium rails for idle silicon."
        copy="Built to feel like a product, not a faucet. Clear pricing, verified output, and a wallet-native payout path."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass group rounded-2xl p-6 transition hover:border-white/15"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/20">
              <item.icon size={18} />
            </div>
            <h3 className="mt-5 font-display text-lg text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{item.copy}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
