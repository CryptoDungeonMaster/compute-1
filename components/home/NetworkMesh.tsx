"use client";

import { motion } from "framer-motion";
import { Check, Cpu, FileText, LockKeyhole, Wallet } from "lucide-react";

const workers = [
  { top: "16%", label: "GPU 01" },
  { top: "50%", label: "GPU 02" },
  { top: "84%", label: "GPU 03" },
];

export function NetworkMesh({ compact = false }: { compact?: boolean }) {
  return <div className={`relative aspect-[1.8] w-full ${compact ? "max-w-[560px]" : ""}`} aria-label="A renter funds a job, workers compute it, the result is verified, and payment settles">
    <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 900 500" fill="none" aria-hidden="true">
      <g stroke="rgba(245,245,245,.14)" strokeWidth="1">
        <path d="M115 250H245"/><path d="M295 250C370 250 390 80 476 80"/><path d="M295 250H476"/><path d="M295 250C370 250 390 420 476 420"/>
        <path d="M524 80C610 80 590 250 666 250"/><path d="M524 250H666"/><path d="M524 420C610 420 590 250 666 250"/>
        <path d="M714 250H816"/><path d="M90 226C90 80 160 80 246 80"/><path strokeDasharray="4 6" d="M294 80H840V226"/>
      </g>
      <g stroke="#00e878" strokeWidth="1.4" strokeLinecap="round">
        <motion.path d="M115 250H245" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .5 }}/>
        <motion.path d="M524 250H666" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: .45, duration: .6 }}/>
        <motion.path d="M714 250H816" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.05, duration: .45 }}/>
      </g>
      <circle r="4" fill="#00e878"><animateMotion dur="3.4s" repeatCount="indefinite" path="M115 250H245C370 250 390 80 476 80"/></circle>
      <circle r="3" fill="#f5f5f5"><animateMotion begin=".8s" dur="3.4s" repeatCount="indefinite" path="M295 250H476H666"/></circle>
      <circle r="3" fill="#00e878"><animateMotion begin="1.7s" dur="3.4s" repeatCount="indefinite" path="M524 420C610 420 590 250 666 250H816"/></circle>
      <circle r="3" fill="#00e878"><animateMotion begin=".4s" dur="4.2s" repeatCount="indefinite" path="M90 226C90 80 160 80 246 80"/></circle>
      <circle r="3" fill="#00e878"><animateMotion begin="2.3s" dur="4.2s" repeatCount="indefinite" path="M294 80H840V226"/></circle>
    </svg>

    <Node left="10%" top="50%" icon={<Wallet size={compact ? 14 : 17}/>} label="Renter" meta="funds task"/>
    <Node left="30%" top="50%" icon={<FileText size={compact ? 14 : 17}/>} label="Job" meta="routes work"/>
    <Node left="30%" top="16%" icon={<LockKeyhole size={compact ? 14 : 17}/>} label="Escrow" meta="SOL locked"/>
    {workers.map((worker, index) => <Node key={worker.label} left="55.56%" top={worker.top} icon={<Cpu size={compact ? 14 : 17}/>} label={worker.label} meta={index === 1 ? "processing" : "available"}/>) }
    <Node left="76.67%" top="50%" icon={<Check size={compact ? 14 : 17}/>} label="Result" meta="verified" accent/>
    <Node left="93.33%" top="50%" icon={<Wallet size={compact ? 14 : 17}/>} label="Settle" meta="claimable" accent/>
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
