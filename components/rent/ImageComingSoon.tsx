"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Coins, ImageIcon, LoaderCircle } from "lucide-react";
import { Button, Panel } from "@/components/ui";
import { useMesh } from "@/components/MeshProvider";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function ImageComingSoon() {
  const { submitJob } = useMesh();
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState("0.01");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!prompt.trim() || Number(budget) < 0.01) return;
    setBusy(true); setImage(""); setMessage("Confirm the escrow deposit in your wallet…");
    try {
      const posted = await submitJob({ prompt, modelSource: "managed:image", budget });
      if (posted.error || !posted.job) throw new Error(posted.error || "Escrow funding failed.");
      setMessage("Funded. Randomly matching an online GPU worker…");
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "image", prompt, jobId: posted.job.id, accessToken: posted.job.accessToken }) });
        const data = await response.json();
        if (response.status === 409 && data.waiting) { await wait(3000); continue; }
        if (!response.ok) throw new Error(data.error || "Image generation failed.");
        setImage(data.dataUrl); setMessage("Complete · worker reward is now claimable."); return;
      }
      setMessage("Still funded and queued. Keep this page open while a worker comes online.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Image generation failed."); }
    finally { setBusy(false); }
  };

  return <Panel className="group h-full overflow-hidden p-0 md:p-0">
    <div className="border-b border-ivory/[.08] bg-gradient-to-br from-[#a855f7]/[.12] via-gold/[.04] to-transparent p-6 md:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Create visuals</p><h2 className="mt-2 text-2xl font-medium tracking-[-.03em] text-ivory">Image studio</h2></div><div className="rounded-xl border border-[#c084fc]/20 bg-[#a855f7]/10 p-3 text-[#d8b4fe]"><ImageIcon size={22}/></div></div>
      <p className="mt-3 text-sm leading-relaxed text-stone">Turn a prompt into an image while rewarding a randomly matched online worker.</p>
    </div>
    <div className="p-6 md:p-8">
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} placeholder="A cinematic floating compute city at night…" className="field w-full resize-none"/>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block"><Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" size={15}/><input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} min="0.01" step="0.01" className="field w-full pl-10" aria-label="Image task budget in SOL"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-[.18em] text-stone">SOL · min 0.01</span></label>
        <Button onClick={submit} disabled={busy || !prompt.trim() || Number(budget) < 0.01} className="min-w-40">{busy ? <><LoaderCircle size={14} className="animate-spin"/>Processing</> : "Fund & generate"}</Button>
      </div>
      {message ? <p className="mt-4 flex items-center gap-2 text-xs text-stone">{image ? <CheckCircle2 size={14} className="text-gold"/> : null}{message}</p> : null}
      {image ? <div className="relative mt-6 aspect-square overflow-hidden rounded-xl border border-ivory/10 bg-black"><Image src={image} alt={prompt} fill unoptimized className="object-contain" /></div> : null}
    </div>
  </Panel>;
}
