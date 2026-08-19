"use client";

import { motion } from "framer-motion";
import { Cpu, Radio, Wallet, Coins } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Connect a wallet",
    copy: "Phantom, Solflare, or Backpack. Your address is how you earn and how you pay.",
    icon: Wallet,
  },
  {
    n: "02",
    title: "Keep a tab open",
    copy: "TabPower uses WebGPU in the browser. No binary, no extension required to start.",
    icon: Radio,
  },
  {
    n: "03",
    title: "Share idle compute",
    copy: "When your GPU is free, it joins the mesh. Jobs are sandboxed and verified in redundant slices.",
    icon: Cpu,
  },
  {
    n: "04",
    title: "Earn PF + SOL",
    copy: "Rewards stream as jobs complete. Claim to your wallet whenever you want.",
    icon: Coins,
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps. Zero installs."
        copy="The mesh is just open browsers. Connect, leave the tab running, and get paid for cycles that were going to idle anyway."
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className="glass relative overflow-hidden rounded-2xl p-6"
          >
            <p className="font-display text-sm text-white/25">{step.n}</p>
            <step.icon className="mt-5 text-accent-blue" size={22} />
            <h3 className="mt-4 font-display text-xl text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{step.copy}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
