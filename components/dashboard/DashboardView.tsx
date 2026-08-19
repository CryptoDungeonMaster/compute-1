"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";
import {
  Button,
  EmptyState,
  GlassCard,
  ProgressBar,
  Section,
  StatusPill,
} from "@/components/ui";
import { dashboardFromSeed } from "@/lib/mock";
import { formatNumber, hashSeed, shortenAddress } from "@/lib/utils";

export function DashboardView() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [autoClaim, setAutoClaim] = useState(true);
  const [idleOnly, setIdleOnly] = useState(true);
  const [cap, setCap] = useState(70);
  const [notes, setNotes] = useState(true);

  const data = useMemo(() => {
    const seed = publicKey ? hashSeed(publicKey.toBase58()) : 42;
    return dashboardFromSeed(seed);
  }, [publicKey]);

  if (!connected || !publicKey) {
    return (
      <Section className="pt-28">
        <EmptyState
          title="Connect to open your dashboard"
          copy="Earnings, spend, active jobs, and settings live behind your Solana address. Phantom, Solflare, and Backpack are supported."
          icon={<Wallet size={18} />}
          action={
            <Button onClick={() => setVisible(true)}>Connect wallet</Button>
          }
        />
      </Section>
    );
  }

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-6 pt-16 md:pt-24">
        <p className="eyebrow">Dashboard</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            {shortenAddress(publicKey.toBase58(), 6)}
          </h1>
          <StatusPill tone="green">Wallet connected</StatusPill>
        </div>
      </section>

      <Section className="pt-2">
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Earned
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {formatNumber(data.earnPf, 1)} PF
            </p>
            <p className="mt-1 text-sm text-accent-green">
              {data.earnSol.toFixed(3)} SOL
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Spent
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {data.spentSol.toFixed(3)} SOL
            </p>
            <p className="mt-1 text-sm text-white/50">
              {formatNumber(data.spentPf, 0)} PF
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Claimable
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {formatNumber(data.claimablePf, 1)} PF
            </p>
            <p className="mt-1 text-sm text-white/50">
              {data.claimableSol.toFixed(3)} SOL
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Active jobs
            </p>
            <p className="mt-2 font-display text-2xl text-white">
              {data.jobs.filter((j) => j.status !== "Complete").length}
            </p>
            <p className="mt-1 text-sm text-white/50">Across both roles</p>
          </GlassCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard>
            <h2 className="font-display text-xl text-white">Active jobs</h2>
            <ul className="mt-5 space-y-4">
              {data.jobs.map((job) => (
                <li key={job.id} className="rounded-xl bg-white/3 p-4 ring-1 ring-white/8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-white">{job.name}</p>
                    <div className="flex items-center gap-2">
                      <StatusPill tone="muted">{job.role}</StatusPill>
                      <StatusPill
                        tone={
                          job.status === "Complete"
                            ? "green"
                            : job.status === "Verifying"
                              ? "purple"
                              : "blue"
                        }
                      >
                        {job.status}
                      </StatusPill>
                    </div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={job.progress}
                      tone={job.status === "Complete" ? "green" : "blue"}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/40">{job.value}</p>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl text-white">Settings</h2>
            <div className="mt-5 space-y-5">
              <Toggle
                label="Share only while idle"
                copy="Pause kernels when this tab is focused."
                on={idleOnly}
                setOn={setIdleOnly}
              />
              <Toggle
                label="Auto-claim"
                copy="Sweep rewards above 10 PF."
                on={autoClaim}
                setOn={setAutoClaim}
              />
              <Toggle
                label="Notifications"
                copy="Job complete and slash alerts."
                on={notes}
                setOn={setNotes}
              />
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/70">Max GPU cap</span>
                  <span className="text-white">{cap}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={cap}
                  onChange={(e) => setCap(Number(e.target.value))}
                  className="w-full accent-accent-blue"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mt-4 overflow-hidden p-0">
          <div className="px-6 py-5">
            <h2 className="font-display text-xl text-white">
              Transaction history
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/35">
                <tr className="border-y border-white/8">
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Token</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">When</th>
                  <th className="px-6 py-3 font-medium">Sig</th>
                </tr>
              </thead>
              <tbody>
                {data.txs.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/6 text-white/80">
                    <td className="px-6 py-3.5">{tx.action}</td>
                    <td className="px-6 py-3.5">{tx.amount}</td>
                    <td className="px-6 py-3.5">{tx.token}</td>
                    <td className="px-6 py-3.5">
                      <StatusPill tone={tx.status === "Confirmed" ? "green" : "purple"}>
                        {tx.status}
                      </StatusPill>
                    </td>
                    <td className="px-6 py-3.5 text-white/50">{tx.time}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-white/40">
                      {tx.sig}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </Section>
    </div>
  );
}

function Toggle({
  label,
  copy,
  on,
  setOn,
}: {
  label: string;
  copy: string;
  on: boolean;
  setOn: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className="flex w-full items-start justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-sm text-white">{label}</span>
        <span className="mt-0.5 block text-xs text-white/45">{copy}</span>
      </span>
      <span
        className={`relative mt-0.5 h-6 w-11 rounded-full transition ${
          on ? "bg-accent-green" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
