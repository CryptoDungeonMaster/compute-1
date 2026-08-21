"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NetworkMesh } from "@/components/home/NetworkMesh";
import { Button } from "@/components/ui";

type Stats = { workers: number; jobsToday: number; settledSol: number; capacityTflops: number };
const EMPTY_STATS: Stats = { workers: 0, jobsToday: 0, settledSol: 0, capacityTflops: 0 };

export function Hero() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let active = true; const load = async () => { try { const response = await fetch("/api/stats"); const data = await response.json(); if (response.ok && active) setStats(data); } finally { if (active) setLoaded(true); } }; load(); const timer = window.setInterval(load, 15_000); return () => { active = false; window.clearInterval(timer); }; }, []);
  const capacity = stats.capacityTflops >= 1000 ? `${(stats.capacityTflops / 1000).toFixed(2)} PFLOPS` : `${stats.capacityTflops.toFixed(2)} TFLOPS`;
  const metrics = [[loaded ? stats.workers.toLocaleString() : "—", "workers online"], [loaded ? capacity : "—", "reported capacity"], [loaded ? stats.jobsToday.toLocaleString() : "—", "jobs today"], [loaded ? `${stats.settledSol.toFixed(4)} SOL` : "—", "settled"]];

  return <section className="relative min-h-[780px] overflow-hidden border-b border-ivory/[.08] bg-[#040504]">
    <div className="square-grid absolute inset-0 opacity-80"/>
    <div className="relative mx-auto grid min-h-[780px] max-w-page items-center gap-10 px-6 pb-12 pt-28 lg:grid-cols-[1.08fr_.92fr]">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }}>
        <p className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold"/>Compute marketplace · Solana</p>
        <h1 className="mt-7 max-w-3xl text-6xl font-medium leading-[.92] tracking-[-.075em] text-ivory sm:text-7xl md:text-[88px]">Idle compute,<br/><span className="text-gold">settled.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-stone md:text-lg">A direct market for GPU work. Rent capacity, verify the result, then release SOL to the machines that completed it.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button href="/earn">Start earning <ArrowUpRight size={14}/></Button><Button href="/rent" variant="secondary">Rent compute</Button></div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: .8 }} className="relative hidden lg:block"><NetworkMesh compact/></motion.div>
      <div className="col-span-full grid grid-cols-2 border-y border-ivory/[.1] sm:grid-cols-4">{metrics.map(([value, label], index) => <div key={label} className={`py-4 ${index ? "border-l border-ivory/[.1] pl-4 sm:pl-6" : "pr-4"}`}><p className="font-mono text-sm text-ivory">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-stone">{label}</p></div>)}</div>
    </div>
    <div className="compute-stream absolute bottom-0 h-px w-full bg-ivory/[.08]"/>
  </section>;
}
