"use client";

import { motion } from "framer-motion";
import { Check, Cpu, FileText, LockKeyhole, Wallet } from "lucide-react";

const workers = [
  { top: "8%", label: "GPU 01" },
  { top: "43%", label: "GPU 02" },
  { top: "78%", label: "GPU 03" },
];

export function NetworkMesh({ compact = false }: { compact?: boolean }) {
  return <div className={`relative w-full ${compact ? "aspect-[1.15] max-w-[530px]" : "aspect-[1.8]"}`} aria-label="A renter funds a job, workers compute it, the result is verified, and payment settles">
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 900 500" fill="none" aria-hidden="true">
      <g stroke="rgba(245,245,245,.14)" strokeWidth="1">
        <path d="M105 250H262"/><path d="M305 250C380 250 390 72 500 72"/><path d="M305 250H500"/><path d="M305 250C380 250 390 428 500 428"/>
        <path d="M550 72C640 72 630 250 720 250"/><path d="M550 250H720"/><path d="M550 428C640 428 630 250 720 250"/>
        <path d="M765 250H850"/><path d="M195 105V215"/><path d="M195 105H815V215"/>
      </g>
      <g stroke="#00e878" strokeWidth="1.4" strokeLinecap="round">
        <motion.path d="M105 250H262" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .5 }}/>
        <motion.path d="M550 250H720" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: .45, duration: .6 }}/>
        <motion.path d="M765 250H850" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.05, duration: .45 }}/>
      </g>
      <circle r="4" fill="#00e878"><animateMotion dur="3.4s" repeatCount="indefinite" path="M105 250H262C380 250 390 72 500 72"/></circle>
      <circle r="3" fill="#f5f5f5"><animateMotion begin=".8s" dur="3.4s" repeatCount="indefinite" path="M305 250H500H720"/></circle>
      <circle r="3" fill="#00e878"><animateMotion begin="1.7s" dur="3.4s" repeatCount="indefinite" path="M550 428C640 428 630 250 720 250H850"/></circle>
      <circle r="3" fill="#00e878"><animateMotion begin="2.3s" dur="4.2s" repeatCount="indefinite" path="M815 215V105H195V215"/></circle>
    </svg>

    <Node left="2%" top="43%" icon={<Wallet size={compact ? 14 : 17}/>} label="Renter" meta="funds task"/>
    <Node left="27%" top="43%" icon={<FileText size={compact ? 14 : 17}/>} label="Job" meta="routes work"/>
    <Node left="17%" top="10%" icon={<LockKeyhole size={compact ? 14 : 17}/>} label="Escrow" meta="SOL locked"/>
    {workers.map((worker, index) => <Node key={worker.label} left="54%" top={worker.top} icon={<Cpu size={compact ? 14 : 17}/>} label={worker.label} meta={index === 1 ? "processing" : "available"}/>) }
    <Node left="77%" top="43%" icon={<Check size={compact ? 14 : 17}/>} label="Result" meta="verified" accent/>
    <Node left="91%" top="43%" icon={<Wallet size={compact ? 14 : 17}/>} label="Settle" meta="claimable" accent/>
    {!compact ? <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center font-mono text-[9px] uppercase tracking-[.18em] text-stone">Payment remains locked until the result is complete</div> : null}
  </div>;
}

function Node({ left, top, icon, label, meta, accent = false }: { left: string; top: string; icon: React.ReactNode; label: string; meta: string; accent?: boolean }) {
  return <div style={{ left, top }} className="absolute -translate-x-1/2 -translate-y-1/2 text-center">
    <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full border bg-[#070908] ${accent ? "border-gold/60 text-gold" : "border-ivory/20 text-ivory"}`}>{icon}</div>
    <p className="mt-2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[.12em] text-ivory">{label}</p>
    <p className="mt-0.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[.1em] text-stone">{meta}</p>
  </div>;
}
