"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { OctagonX, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { Button, Panel, StatusPill } from "@/components/ui";
import { shortenAddress } from "@/lib/utils";
import type { JobDoc, LedgerEntry, WorkerDoc } from "@/lib/types";

const ADMIN_WALLET = "298gTyREYCBykFYSd66Y2Nj18d2TtaWFtF1cTn96dyoW";
type Overview = { workers: WorkerDoc[]; jobs: JobDoc[]; ledger: LedgerEntry[]; wallets: string[]; mongo: boolean };
type AdminProof = { wallet: string; message: string; token: string; signature: string };

function signatureToBase64(signature: Uint8Array) {
  let value = ""; signature.forEach((byte) => { value += String.fromCharCode(byte); }); return btoa(value);
}

export function AdminOverview() {
  const { publicKey, signMessage } = useWallet();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [proof, setProof] = useState<AdminProof | null>(null);
  const [message, setMessage] = useState("Requesting administrator access…");
  const [killing, setKilling] = useState<string | null>(null);
  const [speeding, setSpeeding] = useState<string | null>(null);
  const wallet = publicKey?.toBase58();

  const loadOverview = useCallback(async (auth: AdminProof) => {
    const response = await fetch("/api/admin/overview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(auth) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Administrator verification failed.");
    setOverview(data); setMessage("");
  }, []);

  useEffect(() => {
    if (wallet !== ADMIN_WALLET) return;
    if (!signMessage) { setMessage("This wallet does not support message signing."); return; }
    let active = true;
    (async () => {
      try {
        const challengeResponse = await fetch("/api/admin/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet }) });
        const challenge = await challengeResponse.json();
        if (!challengeResponse.ok) throw new Error(challenge.error || "Unable to request administrator access.");
        const signature = signatureToBase64(await signMessage(new TextEncoder().encode(challenge.message)));
        const auth = { wallet, message: challenge.message, token: challenge.token, signature };
        if (!active) return; setProof(auth); await loadOverview(auth);
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : "Administrator verification failed."); }
    })();
    return () => { active = false; };
  }, [wallet, signMessage, loadOverview]);

  const kill = async (jobId: string) => {
    if (!proof) return;
    setKilling(jobId); setMessage("Stopping task and releasing its worker…");
    try {
      const response = await fetch("/api/admin/jobs/kill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...proof, jobId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Task could not be stopped.");
      await loadOverview(proof); setMessage("Task stopped. No completion credit was issued.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Task could not be stopped."); }
    finally { setKilling(null); }
  };

  const expedite = async (jobId: string) => {
    if (!proof) return;
    setSpeeding(jobId); setMessage("Advancing the task processing window…");
    try {
      const response = await fetch("/api/admin/jobs/expedite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...proof, jobId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Task could not be sped up.");
      await loadOverview(proof); setMessage("Task is ready to complete now.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Task could not be sped up."); }
    finally { setSpeeding(null); }
  };

  if (wallet !== ADMIN_WALLET) return null;
  if (!overview) return <Panel className="mt-4"><p className="eyebrow">Administrator</p><p className="mt-3 text-sm text-stone">{message}</p></Panel>;

  const activeJobs = overview.jobs.filter((job) => job.status === "open" || job.status === "running").length;
  return <section className="mt-4 space-y-4">
    <Panel><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="rounded-xl border border-gold/20 bg-gold/10 p-3 text-gold"><ShieldCheck size={22}/></div><div><p className="eyebrow">Administrator · signed</p><h2 className="mt-2 text-2xl font-medium tracking-[-.03em] text-ivory">Network control room</h2></div></div><div className="flex items-center gap-3"><StatusPill live>{overview.mongo ? "MongoDB live" : "Local store"}</StatusPill><button onClick={() => proof && loadOverview(proof)} className="rounded-lg border border-ivory/10 p-2 text-stone transition hover:border-gold/30 hover:text-gold" aria-label="Refresh admin overview"><RefreshCw size={15}/></button></div></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-5"><Metric label="Wallets" value={String(overview.wallets.length)}/><Metric label="Workers" value={String(overview.workers.length)}/><Metric label="Active tasks" value={String(activeJobs)}/><Metric label="All tasks" value={String(overview.jobs.length)}/><Metric label="Settlements" value={String(overview.ledger.length)}/></div>
      {message ? <p className="mt-5 text-xs text-stone">{message}</p> : null}
    </Panel>

    <div className="grid gap-4 xl:grid-cols-2">
      <Panel><h3 className="text-lg font-medium text-ivory">Connected wallets</h3>{overview.wallets.length ? <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">{overview.wallets.map((address) => <li key={address} className="flex justify-between py-3 font-mono text-xs text-ivory"><span>{shortenAddress(address, 7)}</span><span className="text-stone">{overview.workers.filter((worker) => worker.wallet === address).length} workers</span></li>)}</ul> : <p className="mt-5 text-sm text-stone">No wallet activity recorded.</p>}</Panel>
      <Panel><h3 className="text-lg font-medium text-ivory">Workers</h3>{overview.workers.length ? <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">{overview.workers.map((worker) => <li key={worker.id} className="py-3 text-xs"><div className="flex justify-between gap-4 text-ivory"><span>{worker.name || worker.adapter}</span><span className={worker.status === "busy" ? "text-gold" : "text-stone"}>{worker.status.toUpperCase()}</span></div><p className="mt-1 font-mono text-[10px] text-stone">{worker.wallet ? shortenAddress(worker.wallet, 7) : "NO PAYOUT WALLET"} · {worker.kind}</p></li>)}</ul> : <p className="mt-5 text-sm text-stone">No workers connected.</p>}</Panel>
    </div>

    <Panel><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Operations</p><h3 className="mt-2 text-xl font-medium text-ivory">All renter tasks</h3></div><p className="hidden text-xs text-stone sm:block">Kill releases the worker and prevents settlement.</p></div>
      {overview.jobs.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead className="border-y border-ivory/10 font-mono text-[9px] tracking-[.14em] text-stone"><tr><th className="py-3 font-normal">TASK</th><th className="font-normal">RENTER</th><th className="font-normal">WORKER</th><th className="font-normal">REWARD</th><th className="font-normal">STATUS</th><th className="text-right font-normal">CONTROL</th></tr></thead><tbody>{overview.jobs.map((job) => { const active = job.status === "open" || job.status === "running"; const canSpeed = job.status === "running" && Boolean(job.readyAt && job.readyAt > Date.now()); return <tr key={job.id} className="border-b border-ivory/[.06] text-ivory"><td className="max-w-[250px] py-4 pr-6"><p className="truncate">{job.prompt}</p><p className="mt-1 font-mono text-[10px] text-stone">{job.id}</p></td><td className="font-mono text-[10px]">{job.wallet ? shortenAddress(job.wallet, 6) : "—"}</td><td className="font-mono text-[10px]">{job.workerId ? shortenAddress(job.workerId, 6) : "UNMATCHED"}</td><td className="font-mono">{job.budget} SOL</td><td className={job.status === "done" ? "text-gold" : job.status === "killed" ? "text-red-400" : "text-stone"}>{job.status.toUpperCase()}</td><td className="py-2 text-right">{active ? <div className="flex justify-end gap-2">{canSpeed ? <Button variant="secondary" onClick={() => expedite(job.id)} disabled={Boolean(speeding || killing)} className="px-3 py-2"><Zap size={13}/>{speeding === job.id ? "Advancing" : "Finish now"}</Button> : null}<Button variant="secondary" onClick={() => kill(job.id)} disabled={Boolean(killing || speeding)} className="border-red-400/25 px-3 py-2 text-red-300 hover:border-red-400/60 hover:text-red-200"><OctagonX size={13}/>{killing === job.id ? "Stopping" : "Kill"}</Button></div> : <span className="text-[10px] uppercase tracking-[.16em] text-stone/50">Closed</span>}</td></tr>; })}</tbody></table></div> : <p className="mt-5 text-sm text-stone">No tasks posted.</p>}
    </Panel>
  </section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-ivory/[.07] bg-black/15 p-4"><p className="text-[9px] uppercase tracking-[.16em] text-stone">{label}</p><p className="mt-2 font-mono text-xl text-ivory">{value}</p></div>;
}
