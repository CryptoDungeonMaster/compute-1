"use client";

import { motion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui";

const MARKET = [["RTX 4090", "482", "82.6 TFLOPS", "0.0042 SOL/hr", "+3.2%", true], ["RTX 4080", "316", "48.7 TFLOPS", "0.0031 SOL/hr", "−1.8%", false], ["RTX 3090", "241", "35.6 TFLOPS", "0.0024 SOL/hr", "+0.6%", true], ["Apple M4 Max", "184", "—", "0.0019 SOL/hr", "+4.1%", true]];

export function Market() {
  return <Section id="market" className="py-24 md:py-32"><SectionHeading eyebrow="Live capacity" title="Compute has a price." copy="Live capacity across the ComputeFi network." /><div className="mt-14 overflow-hidden border-y border-ivory/[.09]"><div className="grid grid-cols-[1.35fr_.65fr_1fr_1fr_.55fr] gap-4 border-b border-ivory/[.07] px-4 py-3 font-mono text-[9px] tracking-[.16em] text-stone sm:px-6"><span>HARDWARE</span><span>AVAILABLE</span><span>PERFORMANCE</span><span>RATE</span><span>24H</span></div>{MARKET.map(([name, available, performance, rate, change, up], index) => <motion.div key={String(name)} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }} className="group grid grid-cols-[1.35fr_.65fr_1fr_1fr_.55fr] items-center gap-4 border-b border-ivory/[.06] px-4 py-5 transition-colors hover:bg-ivory/[.025] sm:px-6"><span className="text-sm text-ivory group-hover:text-gold">{name}</span><span className="font-mono text-xs text-ivory/80">{available}</span><span className="font-mono text-[11px] text-stone">{performance}</span><span className="font-mono text-[11px] text-ivory">{rate}</span><span className={`font-mono text-[11px] ${up ? "text-gold" : "text-stone"}`}>{change}</span></motion.div>)}</div></Section>;
}
