"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Check, ChevronDown, Minus, Plus, Power, Terminal } from "lucide-react";
import { Section } from "@/components/ui";

const workloads = ["AI Inference", "Model Training", "Rendering", "Batch Processing", "Custom Container"];
const gpus = ["RTX 4090", "RTX 5090", "A100", "H100", "H200", "Auto Match"];
const gpuRate: Record<string, number> = { "RTX 4090": .10525, "RTX 5090": .1475, A100: .312, H100: .468, H200: .556, "Auto Match": .097 };
const market = [
  ["RTX 4090", "24 GB", "142", "38", "0.0142", "LIVE"],
  ["RTX 5090", "32 GB", "84", "19", "0.0218", "LIVE"],
  ["A100", "80 GB", "31", "7", "0.0834", "LIVE"],
  ["H100", "80 GB", "18", "3", "0.1248", "SCARCE"],
  ["H200", "141 GB", "9", "2", "0.1782", "SCARCE"],
];

export function ProtocolProduct() {
  return <>
    <SettlementPath />
    <RentTicket />
    <WorkerConsole />
    <Market />
    <JobTerminal />
    <Verification />
  </>;
}

function SettlementPath() {
  const [active, setActive] = useState(2);
  const steps = [
    ["01", "FUND", "SOL enters a program-controlled escrow account."],
    ["02", "DISPATCH", "The scheduler routes chunks to eligible machines."],
    ["03", "COMPUTE", "Workers execute in parallel and report progress."],
    ["04", "VERIFY", "Results and execution proofs are checked."],
    ["05", "SETTLE", "Escrow releases SOL to verified contributors."],
  ];
  return <Section id="settlement" className="py-28 md:py-40">
    <div className="grid gap-10 border-t border-ivory/10 pt-8 md:grid-cols-[1fr_.7fr] md:items-end">
      <div><p className="eyebrow">The settlement path</p><h2 className="mt-5 text-5xl font-medium leading-[.96] tracking-[-.065em] md:text-7xl">Work first.<br/>Payment after proof.</h2></div>
      <p className="max-w-md text-sm leading-7 text-stone">The network separates funding from settlement. Workers can collaborate when a larger task benefits from parallel capacity.</p>
    </div>
    <div className="mt-16 grid border-y border-ivory/10 md:grid-cols-5">
      {steps.map(([n, label, copy], i) => <button key={label} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className={`group relative min-h-36 border-ivory/10 p-5 text-left transition md:border-l ${i === 0 ? "md:border-l-0" : "border-t md:border-t-0"}`}>
        <span className={`font-mono text-[10px] tracking-[.16em] ${active === i ? "text-gold" : "text-stone"}`}>{n}</span>
        <span className="mt-4 block text-xs tracking-[.18em] text-ivory">{label}</span>
        <span className={`mt-4 block text-xs leading-5 text-stone transition ${active === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{copy}</span>
        <span className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ${active === i ? "w-full" : "w-0"}`}/>
      </button>)}
    </div>
  </Section>;
}

function RentTicket() {
  const [workload, setWorkload] = useState(workloads[0]); const [gpu, setGpu] = useState(gpus[0]);
  const [qty, setQty] = useState(4); const [duration, setDuration] = useState(2); const [state, setState] = useState("FUND JOB →");
  const cost = (gpuRate[gpu] * qty * duration).toFixed(3); const capacity = Math.round(82 * qty * (gpu.includes("H") ? 2.4 : gpu === "A100" ? 1.7 : 1));
  const fund = () => { setState("REQUEST SENT"); setTimeout(() => setState("JOB FUNDED ✓"), 900); setTimeout(() => setState("FUND JOB →"), 2600); };
  return <section id="rent" className="border-y border-ivory/10 bg-[#050706]"><Section className="grid gap-16 py-28 md:grid-cols-[.8fr_1.2fr] md:py-40">
    <div><p className="eyebrow">Rent compute / 01</p><h2 className="mt-5 text-5xl font-medium leading-[.94] tracking-[-.065em] md:text-7xl">Compute,<br/>on demand.</h2><p className="mt-7 max-w-sm text-sm leading-7 text-stone">Build a funded job and route it to verified capacity. Pricing updates against live availability.</p></div>
    <div className="border border-ivory/10 bg-[#070A08]">
      <TicketRow label="WORKLOAD"><Select value={workload} onChange={setWorkload} items={workloads}/></TicketRow>
      <TicketRow label="GPU"><Select value={gpu} onChange={setGpu} items={gpus}/></TicketRow>
      <TicketRow label="QUANTITY"><div className="flex items-center gap-5 font-mono text-sm"><button aria-label="Decrease GPUs" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14}/></button><span>{qty} GPUs</span><button aria-label="Increase GPUs" onClick={() => setQty(Math.min(32, qty + 1))}><Plus size={14}/></button></div></TicketRow>
      <TicketRow label="DURATION"><div className="flex items-center gap-5 font-mono text-sm"><button aria-label="Decrease duration" onClick={() => setDuration(Math.max(1, duration - 1))}><Minus size={14}/></button><span>{duration} HOURS</span><button aria-label="Increase duration" onClick={() => setDuration(Math.min(24, duration + 1))}><Plus size={14}/></button></div></TicketRow>
      <div className="grid grid-cols-2 border-t border-ivory/10"><Metric label="ESTIMATED CAPACITY" value={`${capacity} TFLOPS`}/><Metric label="ESTIMATED COST" value={`${cost} SOL`} border/></div>
      <button onClick={fund} className="flex w-full items-center justify-between border-t border-gold/40 px-6 py-5 text-left text-xs font-medium tracking-[.16em] text-gold transition hover:bg-gold/10"><span>{state}</span><span className="font-mono text-[10px] text-stone">SOLANA DEVNET</span></button>
    </div>
  </Section></section>;
}

function Select({ value, onChange, items }: { value: string; onChange: (v: string) => void; items: string[] }) { return <span className="relative block"><select aria-label={value} value={value} onChange={e => onChange(e.target.value)} className="appearance-none bg-transparent pr-8 text-right font-mono text-sm text-ivory outline-none">{items.map(x => <option className="bg-[#070A08]" key={x}>{x}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-stone" size={13}/></span>; }
function TicketRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex min-h-16 items-center justify-between gap-5 border-b border-ivory/10 px-6"><span className="text-[9px] tracking-[.2em] text-stone">{label}</span>{children}</div>; }
function Metric({ label, value, border }: { label: string; value: string; border?: boolean }) { return <div className={`px-6 py-7 ${border ? "border-l border-ivory/10" : ""}`}><p className="text-[9px] tracking-[.18em] text-stone">{label}</p><p className="mt-3 font-mono text-lg text-ivory">{value}</p></div>; }

function WorkerConsole() {
  const [online, setOnline] = useState(false); const [util, setUtil] = useState(0);
  const toggle = () => { setOnline(v => !v); setUtil(online ? 0 : 67); };
  return <Section id="earn" className="grid gap-16 py-28 md:grid-cols-[.8fr_1.2fr] md:py-40">
    <div><p className="eyebrow">Supply compute / 02</p><h2 className="mt-5 text-5xl font-medium leading-[.94] tracking-[-.065em] md:text-7xl">Your GPU shouldn&apos;t<br/>sit idle.</h2><p className="mt-7 max-w-md text-sm leading-7 text-stone">Join the worker network. Keep custody of your machine and receive SOL when verified work completes.</p></div>
    <div className={`border bg-[#070A08] transition ${online ? "border-gold/35" : "border-ivory/10"}`}>
      <div className="flex items-start justify-between border-b border-ivory/10 p-6"><div><p className="text-[9px] tracking-[.2em] text-stone">{online ? "WORKER STATUS" : "GPU DETECTED"}</p><h3 className="mt-3 text-xl tracking-[-.03em]">NVIDIA RTX 4090</h3></div><span className={`flex items-center gap-2 font-mono text-[9px] ${online ? "text-gold" : "text-stone"}`}><i className={`h-1.5 w-1.5 rounded-full ${online ? "animate-pulse bg-gold" : "bg-stone"}`}/>{online ? "WORKER ONLINE" : "AVAILABLE"}</span></div>
      <div className="grid grid-cols-2 md:grid-cols-4">{[["VRAM","24 GB"],["RUNTIME","CUDA 12.8"],["HEALTH","NOMINAL"],["RATE","~0.014 SOL / HR"]].map(([a,b],i)=><Metric key={a} label={a} value={b} border={i>0}/>)}</div>
      {online && <div className="grid grid-cols-2 border-t border-ivory/10 md:grid-cols-4">{[["GPU UTIL",`${util}%`],["VRAM","13.8 / 24 GB"],["TEMP","64°C"],["EARNED TODAY","0.086 SOL"]].map(([a,b],i)=><div key={a} className={`p-5 ${i ? "border-l border-ivory/10" : ""}`}><p className="text-[9px] tracking-[.18em] text-stone">{a}</p><p className="mt-3 font-mono text-sm">{b}</p><MiniGraph active={i < 3}/></div>)}</div>}
      <button onClick={toggle} className={`flex w-full items-center justify-between border-t px-6 py-5 text-xs tracking-[.16em] transition ${online ? "border-ivory/10 text-ivory hover:bg-white/[.03]" : "border-gold/40 text-gold hover:bg-gold/10"}`}><span>{online ? "STOP WORKER" : "START WORKER"}</span><Power size={14}/></button>
    </div>
  </Section>;
}
function MiniGraph({ active }: { active: boolean }) { return <div className="mt-5 flex h-7 items-end gap-[3px]">{[22,35,29,52,44,68,57,78,65,82,72,88].map((h,i)=><i key={i} className={`w-full transition-all ${active ? "bg-gold/40" : "bg-ivory/10"}`} style={{height:`${h}%`}}/>)}</div>; }

function Market() { return <section className="border-y border-ivory/10 bg-[#050706]"><Section className="py-28 md:py-36"><div className="flex items-end justify-between gap-8"><div><p className="eyebrow">Live market</p><h2 className="mt-5 text-4xl font-medium tracking-[-.055em] md:text-6xl">Compute liquidity.</h2></div><p className="hidden font-mono text-[10px] text-stone md:block">UPDATED 0.8S AGO</p></div><div className="mt-14 overflow-hidden border-y border-ivory/10"><div className="hidden grid-cols-6 px-5 py-3 text-[9px] tracking-[.18em] text-stone md:grid">{["GPU","VRAM","WORKERS","AVAILABLE","SOL / HR","STATUS"].map(x=><span key={x}>{x}</span>)}</div>{market.map((row)=><div key={row[0]} className="market-row grid grid-cols-2 gap-y-3 border-t border-ivory/[.07] px-5 py-5 font-mono text-xs transition first:border-t-0 md:grid-cols-6"><span className="text-ivory">{row[0]}</span><span className="text-right text-stone md:text-left">{row[1]}</span><span><i className="mr-2 text-[8px] not-italic text-stone md:hidden">WORKERS</i>{row[2]}</span><span><i className="mr-2 text-[8px] not-italic text-stone md:hidden">AVAILABLE</i>{row[3]}</span><span className="text-ivory">{row[4]}</span><span className={row[5] === "LIVE" ? "text-gold" : "text-[#e6c36a]"}>● {row[5]}</span></div>)}</div></Section></section>; }

function JobTerminal() {
  const [selected, setSelected] = useState(0); const jobs = [["JOB_84F2","RUNNING","4 × RTX 4090","72%","0.382 SOL"],["JOB_B19A","VERIFYING","2 × H100","100%","0.624 SOL"],["JOB_7C21","COMPLETE","8 × A100","100%","1.142 SOL"]];
  const bars = selected === 0 ? [100,100,83,71] : [100,100,100,100];
  return <Section id="studio" className="py-28 md:py-40"><div><p className="eyebrow">Studio / execution terminal</p><h2 className="mt-5 text-5xl font-medium leading-[.95] tracking-[-.06em] md:text-7xl">Inspect every cycle.</h2></div><div className="mt-14 border border-ivory/10 bg-[#050706]">
    <div className="flex gap-6 overflow-x-auto border-b border-ivory/10 px-5 text-[9px] tracking-[.18em] text-stone">{["OVERVIEW","JOBS","WORKERS","SETTLEMENTS","API"].map((x,i)=><button key={x} className={`py-4 ${i===1?"border-b border-gold text-ivory":""}`}>{x}</button>)}</div>
    <div className="grid md:grid-cols-[1.1fr_.9fr]"><div className="border-ivory/10 md:border-r">{jobs.map((j,i)=><button onClick={()=>setSelected(i)} key={j[0]} className={`grid w-full grid-cols-[1.2fr_1fr] gap-y-3 border-b border-ivory/10 p-5 text-left font-mono text-[11px] transition md:grid-cols-5 ${selected===i?"bg-white/[.025]":"hover:bg-white/[.015]"}`}><span className="text-ivory">{j[0]}</span><span className={i===0?"text-gold":"text-stone"}>{j[1]}</span><span>{j[2]}</span><span>{j[3]}</span><span className="text-ivory">{j[4]}</span></button>)}</div><div className="p-6"><div className="flex items-center justify-between"><p className="font-mono text-xs">{jobs[selected][0]} / EXECUTION</p><Activity size={14} className="text-gold"/></div><div className="mt-7 space-y-4">{bars.map((p,i)=><div key={i}><div className="flex justify-between font-mono text-[10px]"><span className="text-stone">GPU 0{i+1}</span><span>{p}%</span></div><div className="mt-2 h-px bg-ivory/10"><motion.div initial={{width:0}} animate={{width:`${p}%`}} className="h-px bg-gold"/></div></div>)}</div><dl className="mt-8 space-y-3 border-t border-ivory/10 pt-5 font-mono text-[9px]">{[["RESULT HASH","9f3a…c82e"],["VERIFICATION",selected===0?"PENDING":"VALID"],["SETTLEMENT",selected===2?"FINALIZED":"LOCKED"]].map(([a,b])=><div key={a} className="flex justify-between"><dt className="text-stone">{a}</dt><dd className={b==="VALID"||b==="FINALIZED"?"text-gold":"text-ivory"}>{b}</dd></div>)}</dl></div></div>
  </div></Section>;
}

function Verification() { const [verified,setVerified]=useState(false); return <section className="relative overflow-hidden border-t border-ivory/10 py-28 md:py-44"><div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[.035] blur-3xl"/><div className="relative mx-auto max-w-page px-6 text-center"><p className="eyebrow">Proof & verification</p><h2 className="mt-6 text-5xl font-medium leading-[.98] tracking-[-.065em] md:text-7xl">Don&apos;t trust the machine.<br/>Verify the work.</h2><p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-stone">Deterministic checks bind a submitted result to the work order before any value can leave escrow.</p><div className="mx-auto mt-16 flex max-w-2xl items-center justify-between"><ProofNode label="WORKER"/><Line active={verified}/><ProofNode label="PROOF" active={verified}/><Line active={verified}/><ProofNode label="VERIFIER" active={verified}/></div><button onClick={()=>setVerified(true)} className={`mx-auto mt-14 flex items-center gap-3 border px-5 py-3 text-[10px] tracking-[.18em] transition ${verified?"border-gold/40 text-gold":"border-ivory/15 text-ivory hover:border-gold/40"}`}>{verified?<><Check size={13}/>RESULT VERIFIED · SETTLEMENT AVAILABLE</>:<>RUN VERIFICATION <ArrowRight size={13}/></>}</button></div></section>; }
function ProofNode({label,active}:{label:string;active?:boolean}) { return <div className="relative"><div className={`grid h-12 w-12 place-items-center rounded-full border ${active?"border-gold text-gold":"border-ivory/20 text-stone"}`}><Terminal size={14}/></div><p className="absolute left-1/2 top-16 -translate-x-1/2 font-mono text-[9px] tracking-[.16em] text-stone">{label}</p></div>; }
function Line({active}:{active:boolean}) { return <div className="relative mx-3 h-px flex-1 bg-ivory/10"><motion.div animate={{width:active?"100%":"0%"}} className="absolute inset-y-0 left-0 bg-gold"/></div>; }
