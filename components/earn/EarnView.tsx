"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Pause,
  Play,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button, GlassCard, ProgressBar, Section, StatusPill } from "@/components/ui";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { EARNINGS_HISTORY } from "@/lib/mock";
import { formatNumber } from "@/lib/utils";

export function EarnView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [sharing, setSharing] = useState(false);
  const [gpu, setGpu] = useState(4);
  const [cpu, setCpu] = useState(8);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!sharing) {
      setGpu(3);
      setCpu(6);
      return;
    }
    const t = window.setInterval(() => {
      setGpu(48 + Math.random() * 32);
      setCpu(22 + Math.random() * 28);
    }, 1400);
    return () => window.clearInterval(t);
  }, [sharing]);

  const ratePf = sharing ? 1.8 + gpu / 80 : 0;
  const rateSol = sharing ? 0.0024 + gpu / 20000 : 0;
  const claimablePf = claimed ? 0 : 24.1;
  const claimableSol = claimed ? 0 : 0.031;

  const history = useMemo(() => EARNINGS_HISTORY, []);

  const startShare = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    setSharing((v) => !v);
  };

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:pt-24">
        <p className="eyebrow">Provider</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-6xl">
          Connect a wallet and start sharing.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/60">
          Leave this tab open. When your GPU is idle, TabPower runs verified
          slices of inference, render, and data jobs — then pays you in PF and
          SOL.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ConnectWalletButton label="Connect Wallet & Start Sharing" />
          <Button
            variant={sharing ? "secondary" : "green"}
            onClick={startShare}
          >
            {sharing ? <Pause size={15} /> : <Play size={15} />}
            {sharing ? "Stop sharing" : "Start sharing compute"}
          </Button>
        </div>
      </section>

      <Section className="pt-6 md:pt-8">
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Estimated / hour
            </p>
            <p className="mt-2 font-display text-3xl text-white">
              {ratePf.toFixed(2)} PF
            </p>
            <p className="mt-1 text-sm text-accent-green">
              + {rateSol.toFixed(4)} SOL
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Today
            </p>
            <p className="mt-2 font-display text-3xl text-white">12.4 PF</p>
            <p className="mt-1 text-sm text-white/50">0.018 SOL settled</p>
          </GlassCard>
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Lifetime
            </p>
            <p className="mt-2 font-display text-3xl text-white">1,204 PF</p>
            <p className="mt-1 text-sm text-white/50">Across 318 jobs</p>
          </GlassCard>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <GlassCard>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">Device status</h2>
              <StatusPill tone={sharing ? "green" : "muted"}>
                {sharing ? "Sharing" : "Idle"}
              </StatusPill>
            </div>
            <div className="mt-8 space-y-6">
              <Meter label="GPU utilization" value={gpu} tone="blue" />
              <Meter label="CPU utilization" value={cpu} tone="purple" />
              <Meter
                label="Network heartbeat"
                value={sharing ? 92 : 12}
                tone="green"
              />
            </div>
            <p className="mt-6 text-sm text-white/45">
              Utilization is sampled from WebGPU adapters in this tab. Sharing
              pauses automatically if the page is hidden and your settings
              require it.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl text-white">Claim rewards</h2>
            <p className="mt-2 text-sm text-white/50">
              Accrued to your connected address. Claim sends PF and SOL in one
              transaction.
            </p>
            <div className="mt-8 rounded-2xl bg-white/4 p-5 ring-1 ring-white/8">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Available
              </p>
              <p className="mt-2 font-display text-3xl text-white">
                {formatNumber(claimablePf, 1)} PF
              </p>
              <p className="text-accent-green">{claimableSol.toFixed(3)} SOL</p>
            </div>
            <Button
              variant="green"
              className="mt-6 w-full"
              disabled={!connected || claimed || claimablePf === 0}
              onClick={() => setClaimed(true)}
            >
              <Wallet size={15} />
              {claimed ? "Claimed" : "Claim rewards"}
            </Button>
            {!connected ? (
              <p className="mt-3 text-center text-xs text-white/40">
                Connect a wallet to claim.
              </p>
            ) : null}
          </GlassCard>
        </div>

        <GlassCard className="mt-4 overflow-hidden p-0">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-display text-xl text-white">Earnings history</h2>
            <StatusPill tone="blue">Last 24h</StatusPill>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/35">
                <tr className="border-y border-white/8">
                  <th className="px-6 py-3 font-medium">Job</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">PF</th>
                  <th className="px-6 py-3 font-medium">SOL</th>
                  <th className="px-6 py-3 font-medium">Duration</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-white/6 text-white/80">
                    <td className="px-6 py-3.5">{row.job}</td>
                    <td className="px-6 py-3.5 text-white/55">{row.type}</td>
                    <td className="px-6 py-3.5">{row.pf.toFixed(1)}</td>
                    <td className="px-6 py-3.5">{row.sol.toFixed(4)}</td>
                    <td className="px-6 py-3.5 text-white/55">{row.duration}</td>
                    <td className="px-6 py-3.5">
                      <StatusPill
                        tone={
                          row.status === "Paid"
                            ? "green"
                            : row.status === "Verifying"
                              ? "purple"
                              : "muted"
                        }
                      >
                        {row.status}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div id="verify" className="mt-14 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Verification</p>
            <h2 className="mt-3 font-display text-3xl text-white">
              Redundant slices, hashed results.
            </h2>
            <p className="mt-4 text-white/55">
              Every job is split and executed by more than one worker. Outputs
              are hashed, compared, and only then released from escrow. A
              mismatch pauses the outlier tab — it does not drain the requester.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "WebGPU kernels run in a sandboxed worker thread",
              "Quorum of 2–3 independent tabs per slice",
              "Result hash posted on Solana before payout",
              "Repeat mismatches auto-pause the device",
            ].map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass flex items-start gap-3 rounded-xl px-4 py-3.5"
              >
                {i === 2 ? (
                  <Shield size={16} className="mt-0.5 text-accent-purple" />
                ) : i === 0 ? (
                  <Sparkles size={16} className="mt-0.5 text-accent-blue" />
                ) : (
                  <CheckCircle2 size={16} className="mt-0.5 text-accent-green" />
                )}
                <p className="text-sm text-white/75">{line}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "purple";
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-white/60">{label}</span>
        <span className="text-white">{Math.round(value)}%</span>
      </div>
      <ProgressBar value={value} tone={tone} />
    </div>
  );
}
