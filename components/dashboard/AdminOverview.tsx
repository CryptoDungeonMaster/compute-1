"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Panel, StatusPill } from "@/components/ui";
import { shortenAddress } from "@/lib/utils";
import type { JobDoc, LedgerEntry, WorkerDoc } from "@/lib/types";

const ADMIN_WALLET = "298gTyREYCBykFYSd66Y2Nj18d2TtaWFtF1cTn96dyoW";
type Overview = { workers: WorkerDoc[]; jobs: JobDoc[]; ledger: LedgerEntry[]; wallets: string[]; mongo: boolean };

function signatureToBase64(signature: Uint8Array) {
  let value = "";
  signature.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value);
}

export function AdminOverview() {
  const { publicKey, signMessage } = useWallet();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("Requesting administrator access…");
  const wallet = publicKey?.toBase58();

  useEffect(() => {
    if (wallet !== ADMIN_WALLET) return;
    if (!signMessage) { setMessage("This wallet does not support message signing. Use a wallet that supports Solana message signatures."); return; }
    let active = true;
    const load = async () => {
      try {
        const challengeResponse = await fetch("/api/admin/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet }) });
        const challenge = await challengeResponse.json();
        if (!challengeResponse.ok) throw new Error(challenge.error || "Unable to request administrator access.");
        const signature = await signMessage(new TextEncoder().encode(challenge.message));
        const response = await fetch("/api/admin/overview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wallet, message: challenge.message, token: challenge.token, signature: signatureToBase64(signature) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Administrator verification failed.");
        if (active) { setOverview(data); setMessage(""); }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : "Administrator verification failed."); }
    };
    load();
    return () => { active = false; };
  }, [wallet, signMessage]);

  if (wallet !== ADMIN_WALLET) return null;
  if (!overview) return <Panel className="mt-4"><p className="eyebrow">Administrator</p><p className="mt-3 text-sm text-stone">{message}</p></Panel>;

  return <section className="mt-4 space-y-4"><Panel><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Administrator · verified</p><h2 className="mt-3 font-display text-2xl text-ivory">System operations</h2></div><StatusPill live>{overview.mongo ? "MongoDB live" : "Local store"}</StatusPill></div><div className="mt-7 grid gap-4 sm:grid-cols-4"><Metric label="Wallets" value={String(overview.wallets.length)} /><Metric label="Workers" value={String(overview.workers.length)} /><Metric label="Jobs" value={String(overview.jobs.length)} /><Metric label="Settlements" value={String(overview.ledger.length)} /></div></Panel>
    <div className="grid gap-4 xl:grid-cols-2"><Panel><h3 className="font-display text-xl text-ivory">Connected wallets</h3>{overview.wallets.length ? <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">{overview.wallets.map((address) => <li key={address} className="flex justify-between py-3 font-mono text-xs text-ivory"><span>{shortenAddress(address, 7)}</span><span className="text-stone">{overview.workers.filter((worker) => worker.wallet === address).length} workers</span></li>)}</ul> : <p className="mt-5 text-sm text-stone">No wallet activity recorded.</p>}</Panel>
      <Panel><h3 className="font-display text-xl text-ivory">Workers</h3>{overview.workers.length ? <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">{overview.workers.map((worker) => <li key={worker.id} className="py-3 text-xs"><div className="flex justify-between gap-4 text-ivory"><span>{worker.adapter}</span><span className={worker.status === "busy" ? "text-gold" : "text-stone"}>{worker.status.toUpperCase()}</span></div><p className="mt-1 font-mono text-[10px] text-stone">{worker.wallet ? shortenAddress(worker.wallet, 7) : "NO WALLET"} · {worker.kind}</p></li>)}</ul> : <p className="mt-5 text-sm text-stone">No workers connected.</p>}</Panel></div>
    <Panel><h3 className="font-display text-xl text-ivory">All renter jobs</h3>{overview.jobs.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="border-y border-ivory/10 font-mono text-[9px] tracking-[.14em] text-stone"><tr><th className="py-3 font-normal">JOB</th><th className="font-normal">RENTER</th><th className="font-normal">WORKER</th><th className="font-normal">BUDGET</th><th className="font-normal">STATUS</th></tr></thead><tbody>{overview.jobs.map((job) => <tr key={job.id} className="border-b border-ivory/[.06] text-ivory"><td className="max-w-[250px] py-3 pr-6"><p className="truncate">{job.prompt}</p><p className="mt-1 font-mono text-[10px] text-stone">{job.id}</p></td><td className="font-mono text-[10px]">{job.wallet ? shortenAddress(job.wallet, 6) : "—"}</td><td className="font-mono text-[10px]">{job.workerId || "UNMATCHED"}</td><td className="font-mono">{job.budget} SOL</td><td className={job.status === "done" ? "text-gold" : "text-stone"}>{job.status.toUpperCase()}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-stone">No jobs posted.</p>}</Panel>
  </section>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] uppercase tracking-[.16em] text-stone">{label}</p><p className="mt-2 font-mono text-xl text-ivory">{value}</p></div>; }
