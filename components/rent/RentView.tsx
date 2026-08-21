"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Cpu, Shuffle, Upload, Vault } from "lucide-react";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { useMesh } from "@/components/MeshProvider";
import { CodeCreator } from "@/components/rent/CodeCreator";
import { ImageComingSoon } from "@/components/rent/ImageComingSoon";
import type { JobDoc } from "@/lib/types";

export function RentView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { workers, jobs, tabId, submitJob } = useMesh();
  const [prompt, setPrompt] = useState("");
  const [modelSource, setModelSource] = useState("");
  const [budget, setBudget] = useState("0.01");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 1024 * 1024) { setMessage("Keep uploads at 1 MB or less."); return; }
    setFileName(file.name);
    setFileData(await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); }));
  };
  const submit = async () => {
    if (!connected) { setVisible(true); return; }
    if (!prompt.trim()) return;
    setPosting(true); setMessage("Confirm the escrow deposit in your wallet…");
    const result = await submitJob({ prompt, modelSource, fileName, fileData, budget });
    setPosting(false);
    if (result.error) { setMessage(result.error); return; }
    setPrompt(""); setModelSource(""); setBudget("0.01"); setFileData(null); setFileName("");
    setMessage("Funded and posted. A compatible worker will be matched automatically.");
  };

  return <div>
    <section className="relative mx-auto max-w-page px-6 pb-14 pt-28 md:pt-36">
      <div className="absolute left-6 top-28 h-24 w-24 rounded-full bg-gold/10 blur-3xl"/>
      <p className="eyebrow">Compute marketplace · live</p>
      <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[.98] tracking-[-.065em] text-ivory md:text-7xl">Create at network speed.<br/><span className="text-gold">Reward real compute.</span></h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-stone">Fund a task from 0.01 SOL. It locks in escrow, matches a random online worker, and becomes claimable after completion.</p>
    </section>
    <Section className="space-y-4 pt-4">
      <div className="grid border-y border-ivory/10 md:grid-cols-3">
        <Flow icon={<Vault size={18}/>} number="01" title="Fund escrow" copy="Choose any reward from 0.01 SOL."/>
        <Flow icon={<Shuffle size={18}/>} number="02" title="Random match" copy="An eligible online worker is selected."/>
        <Flow icon={<Cpu size={18}/>} number="03" title="Run & settle" copy="Completion unlocks a claimable reward."/>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Panel><p className="eyebrow">Custom workload</p><h2 className="mt-2 text-2xl font-medium tracking-[-.03em] text-ivory">Post a compute task</h2><form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); submit(); }}>
          <label className="block"><span className="text-[10px] uppercase tracking-[.2em] text-stone">Instructions</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="Summarize these support tickets and return structured JSON…" className="field mt-2 w-full resize-none"/></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.2em] text-stone">Model or executor</span><input value={modelSource} onChange={(event) => setModelSource(event.target.value)} placeholder="ollama:llama3.2:3b or a Hugging Face ID" className="field mt-2 w-full"/><p className="mt-2 text-xs leading-relaxed text-stone">Custom work is routed to a compatible native worker. The worker owner controls the allow-list.</p></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.2em] text-stone">Optional input</span><span className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ivory/15 bg-black/10 px-4 py-3 text-sm text-stone transition hover:border-gold/50 hover:text-ivory"><Upload size={15}/>{fileName || "Upload a file up to 1 MB"}<input type="file" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])}/></span></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.2em] text-stone">Worker reward</span><div className="relative mt-2"><input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} min="0.01" step="0.01" className="field w-full pr-20"/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gold">SOL</span></div><p className="mt-2 text-xs text-stone">Minimum 0.01 SOL · locked before scheduling · 97.5% settles to the worker.</p></label>
          <Button type="submit" className="w-full" disabled={!prompt.trim() || posting || Number(budget) < .01}>{posting ? "Waiting for wallet" : connected ? "Fund escrow & post" : "Connect wallet to continue"}</Button>
          {message ? <p className="text-sm text-stone">{message}</p> : null}
        </form></Panel>

        <Panel><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Network</p><h2 className="mt-2 text-2xl font-medium tracking-[-.03em] text-ivory">Workers online</h2></div><StatusPill live={workers.length > 0}>{workers.length ? `${workers.length} live` : "Empty"}</StatusPill></div><p className="mt-4 text-sm text-stone">Fresh heartbeats only. Workers need a connected payout wallet to receive tasks.</p>
          {workers.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-ivory/10 p-6 text-sm leading-relaxed text-stone">No machine is available yet. Start a GPU from Earn to join the matching pool.</div> : <ul className="mt-6 space-y-2">{workers.map((worker) => <li key={worker.id} className="rounded-xl border border-ivory/[.07] bg-black/15 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-ivory">{worker.name || worker.adapter}{worker.id === tabId ? " · this device" : ""}</p><p className="mt-1 text-xs text-stone">{worker.kind === "native" ? "Native GPU worker" : "Browser GPU"}{worker.cores != null ? ` · ${worker.cores} cores` : ""}</p></div><StatusPill live={worker.status === "idle"}>{worker.status === "busy" ? "Working" : "Ready"}</StatusPill></div></li>)}</ul>}
        </Panel>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2"><CodeCreator/><ImageComingSoon/></div>

      <Panel><div className="flex items-center justify-between"><div><p className="eyebrow">Activity</p><h2 className="mt-2 text-2xl font-medium tracking-[-.03em] text-ivory">Live task board</h2></div><StatusPill live={jobs.some((job) => job.status === "open" || job.status === "running")}>{jobs.length} total</StatusPill></div>
        {jobs.length === 0 ? <p className="mt-6 text-sm text-stone">Funded tasks will appear here as they move from escrow to worker settlement.</p> : <ul className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">{jobs.map((job) => <li key={job.id} className="py-5"><div className="flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl text-sm text-ivory">{job.prompt}</p><StatusPill live={job.status === "running"}>{statusLabel(job.status)}</StatusPill></div><p className="mt-2 text-xs text-stone">{job.modelSource ? `${job.modelSource} · ` : ""}{job.budget} SOL · {job.workerIds?.length || (job.workerId ? 1 : 0)}/{job.parallelism || 1} workers · {job.status === "running" ? formatEta(job) : job.status === "open" ? `est. ${formatDuration(job.estimatedDurationMs)}` : job.status === "killed" ? "stopped by admin" : "complete"}</p><div className="mt-3 h-1 overflow-hidden bg-ivory/10"><div className={`h-full transition-all duration-700 ${job.status === "killed" ? "bg-red-400" : "bg-gold"}`} style={{ width: `${liveProgress(job)}%` }}/></div><p className="mt-2 text-[11px] text-stone">{job.status === "done" ? "Settled · reward is claimable" : job.status === "killed" ? "Stopped · no worker reward issued" : job.status === "running" ? `Processing · ${formatEta(job)}` : "Queued for a compatible worker"}</p></li>)}</ul>}
      </Panel>
    </Section>
  </div>;
}

function Flow({ icon, number, title, copy }: { icon: React.ReactNode; number: string; title: string; copy: string }) {
  return <div className="flex items-center gap-4 py-5 md:border-l md:border-ivory/10 md:px-6 first:border-l-0"><div className="text-gold">{icon}</div><div><p className="text-[9px] uppercase tracking-[.2em] text-stone">{number}</p><p className="mt-1 text-sm font-medium text-ivory">{title}</p><p className="mt-1 text-xs text-stone">{copy}</p></div></div>;
}

function statusLabel(status: "open" | "running" | "done" | "killed") {
  return status === "open" ? "Waiting" : status === "running" ? "Working" : status === "killed" ? "Killed" : "Settled";
}

function formatDuration(ms = 0) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return seconds < 60 ? `${seconds}s` : `${Math.ceil(seconds / 60)} min`; }
function formatEta(job: JobDoc) { return job.readyAt ? `about ${formatDuration(Math.max(0, job.readyAt - Date.now()))} left` : `est. ${formatDuration(job.estimatedDurationMs)}`; }
function liveProgress(job: JobDoc) { if (job.status === "done" || job.status === "killed") return 100; if (job.status === "open" || !job.startedAt || !job.readyAt) return 0; const window = Math.max(1, job.readyAt - job.startedAt); return Math.min(94, Math.max(job.progress || 5, Math.round(((Date.now() - job.startedAt) / window) * 94))); }
