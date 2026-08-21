"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui";

const STATS = [["2,481", "workers"], ["18.4 PFLOPS", "available"], ["1,284", "jobs today"], ["4,291 SOL", "settled"]];

function ComputeCore() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-150, 150], [-8, 8]), { stiffness: 80, damping: 18 });
  const rotateX = useSpring(useTransform(y, [-150, 150], [7, -7]), { stiffness: 80, damping: 18 });

  return <div onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left - r.width / 2); y.set(e.clientY - r.top - r.height / 2); }} onPointerLeave={() => { x.set(0); y.set(0); }} className="absolute right-[-11rem] top-1/2 hidden h-[620px] w-[620px] -translate-y-1/2 place-items-center md:grid lg:right-[-4rem]">
    <div className="core-ring absolute h-[500px] w-[500px] rounded-full border border-ivory/[.055]" />
    <div className="absolute h-[385px] w-[385px] rounded-full border border-gold/[.12] [mask-image:linear-gradient(90deg,transparent,black_35%,black_65%,transparent)]" />
    <motion.div style={{ rotateX, rotateY, transformPerspective: 1000 }} className="relative h-[270px] w-[270px] [transform-style:preserve-3d]">
      <div className="core-pulse absolute inset-0 rounded-[36px] border border-gold/30 bg-[radial-gradient(circle_at_34%_25%,rgba(255,255,255,.15),transparent_27%),linear-gradient(135deg,#282c2a,#0a0c0b_48%,#181c1a)] shadow-[0_28px_100px_rgba(0,0,0,.65),inset_0_1px_rgba(255,255,255,.18)]" />
      <div className="absolute left-[23%] top-[23%] h-[54%] w-[54%] border-[18px] border-[#060706] shadow-[inset_0_0_20px_rgba(0,232,120,.25)]" />
      <div className="absolute left-[42%] top-[34%] h-[32%] w-[45%] border-y border-r border-gold/60 bg-[#0b0e0c]" />
      <div className="absolute left-[11%] top-1/2 h-px w-[78%] bg-gold/70 shadow-[0_0_18px_#00e878]" />
      {["left-[9%] top-[16%]", "right-[8%] top-[21%]", "bottom-[15%] left-[18%]", "bottom-[13%] right-[17%]"].map((position, i) => <span key={i} className={`absolute ${position} h-1 w-5 bg-gold shadow-[0_0_10px_#00e878]`} />)}
    </motion.div>
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[.2em] text-stone">CF CORE · LIVE ROUTING</div>
  </div>;
}

export function Hero() {
  return <section className="relative min-h-[760px] overflow-hidden border-b border-ivory/[.07] bg-[#050505]">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.027)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.027)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
    <div className="absolute right-0 top-1/4 h-[34rem] w-[34rem] rounded-full bg-gold/[.035] blur-[120px]" />
    <ComputeCore />
    <div className="relative mx-auto flex min-h-[760px] max-w-page items-center px-6 pb-16 pt-24">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="max-w-[670px]">
        <p className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_12px_#00e878]" />Decentralized compute market · Solana</p>
        <h1 className="mt-7 text-5xl font-medium leading-[.97] tracking-[-.07em] text-ivory sm:text-7xl md:text-[84px]">Put idle compute<br />to work.</h1>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-stone md:text-lg">Share unused CPU and GPU capacity and earn SOL. Or rent distributed compute and pay only for verified work.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button href="/earn">Start earning <span className="text-base leading-none">↗</span></Button><Button href="/rent" variant="secondary">Rent compute</Button></div>
        <div className="mt-16 grid max-w-[660px] grid-cols-2 border-y border-ivory/[.09] sm:grid-cols-4">{STATS.map(([value, label]) => <div key={label} className="border-r border-ivory/[.09] py-4 pr-3 last:border-r-0 sm:px-4 first:pl-0"><p className="font-mono text-sm text-ivory">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-stone">{label}</p></div>)}</div>
      </motion.div>
    </div>
    <div className="compute-stream absolute bottom-0 h-px w-full bg-ivory/[.08]" />
    <div className="absolute bottom-6 right-6 hidden font-mono text-[9px] tracking-[.15em] text-stone md:block">REQUEST → ROUTE → COMPUTE → VERIFY → SETTLE</div>
  </section>;
}
