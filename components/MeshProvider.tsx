"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { readDeviceInfo, type DeviceInfo } from "@/lib/device";
import type { JobDoc, WorkerDoc } from "@/lib/types";

type JobInput = { prompt: string; modelSource: string; fileName?: string; fileData?: string | null; budget: string };
type MeshContextValue = {
  device: DeviceInfo | null; sharing: boolean; workers: WorkerDoc[]; jobs: JobDoc[]; assignedJob: JobDoc | null; tabId: string | null; mongo: boolean;
  startSharing: () => void; stopSharing: () => void; submitJob: (input: JobInput) => Promise<{ error?: string }>;
};
const MeshContext = createContext<MeshContextValue | null>(null);
const TAB_KEY = "computefi.tabId";
const SHARE_KEY = "computefi.sharing";
const TOKEN_KEY = "computefi.workerToken";
function tabId() { let id = sessionStorage.getItem(TAB_KEY); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(TAB_KEY, id); } return id; }
function workerToken() { let token = sessionStorage.getItem(TOKEN_KEY); if (!token) { token = crypto.randomUUID(); sessionStorage.setItem(TOKEN_KEY, token); } return token; }

export function MeshProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, sendTransaction } = useWallet();
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [sharing, setSharing] = useState(false); const [workers, setWorkers] = useState<WorkerDoc[]>([]); const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [id, setId] = useState<string | null>(null); const [mongo, setMongo] = useState(false);
  const wallet = publicKey?.toBase58() ?? null;
  const assignedJob = jobs.find((j) => j.workerId === id && j.status === "running") ?? null;
  const refresh = useCallback(async () => { const [w, j] = await Promise.all([fetch("/api/workers").then((r) => r.json()), fetch("/api/jobs").then((r) => r.json())]); setWorkers(w.workers || []); setJobs(j.jobs || []); setMongo(Boolean(w.mongo || j.mongo)); }, []);
  useEffect(() => { setId(tabId()); setSharing(localStorage.getItem(SHARE_KEY) === "1"); readDeviceInfo().then(setDevice); refresh(); const timer = window.setInterval(refresh, 2000); return () => window.clearInterval(timer); }, [refresh]);
  useEffect(() => {
    if (!sharing || !id || !device) return; let stop = false;
    const beat = async () => { await fetch("/api/workers/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, authToken: workerToken(), kind: "webgpu", adapter: device.label, cores: device.cores, wallet }) }); if (!stop) await refresh(); };
    beat(); const timer = window.setInterval(beat, 3000); const leave = () => { stop = true; navigator.sendBeacon?.("/api/workers/leave", new Blob([JSON.stringify({ id })], { type: "application/json" })); };
    window.addEventListener("pagehide", leave); return () => { window.clearInterval(timer); window.removeEventListener("pagehide", leave); };
  }, [sharing, id, device, wallet, refresh]);
  const startSharing = useCallback(() => { localStorage.setItem(SHARE_KEY, "1"); setSharing(true); }, []);
  const stopSharing = useCallback(() => { localStorage.removeItem(SHARE_KEY); setSharing(false); if (id) fetch("/api/workers/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).then(refresh); }, [id, refresh]);
  const submitJob = useCallback(async (input: JobInput) => {
    if (!publicKey) return { error: "Connect your wallet first." };
    const escrowResponse = await fetch("/api/escrow"); const escrow = await escrowResponse.json(); if (!escrowResponse.ok || !escrow.address) return { error: escrow.error || "Escrow is not ready." };
    const sol = Number(input.budget); if (!Number.isFinite(sol) || sol <= 0) return { error: "Enter a SOL budget greater than zero." };
    try {
      const transaction = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(escrow.address), lamports: Math.round(sol * 1_000_000_000) }));
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com", "confirmed"); const signature = await sendTransaction(transaction, connection); await connection.confirmTransaction(signature, "confirmed");
      const response = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, paySignature: signature, wallet }) }); const data = await response.json(); if (!response.ok) return { error: data.error || "The payment was sent, but the job could not be posted." };
    } catch (error) { return { error: error instanceof Error ? error.message : "Wallet payment was cancelled." }; }
    await refresh(); return {};
  }, [publicKey, sendTransaction, wallet, refresh]);
  const value = useMemo(() => ({ device, sharing, workers, jobs, assignedJob, tabId: id, mongo, startSharing, stopSharing, submitJob }), [device, sharing, workers, jobs, assignedJob, id, mongo, startSharing, stopSharing, submitJob]);
  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}
export function useMesh() { const ctx = useContext(MeshContext); if (!ctx) throw new Error("useMesh must be used within MeshProvider"); return ctx; }
