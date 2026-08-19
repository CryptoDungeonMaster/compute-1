"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button, EmptyState, Panel, Section, StatusPill } from "@/components/ui";
import { useMesh } from "@/components/MeshProvider";
import { shortenAddress } from "@/lib/utils";

const SETTINGS_KEY = "tappower.settings";

type Settings = {
  idleOnly: boolean;
  autoClaim: boolean;
  notes: boolean;
  cap: number;
};

const DEFAULTS: Settings = {
  idleOnly: true,
  autoClaim: false,
  notes: true,
  cap: 70,
};

export function DashboardView() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { jobs } = useMesh();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* keep defaults */
    }
  }, []);

  const write = (next: Settings) => {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  if (!connected || !publicKey) {
    return (
      <Section className="pt-32">
        <EmptyState
          title="Connect to open the studio"
          copy="Earnings, spend, jobs, and settings attach to your Solana address. Phantom, Solflare, and Backpack are supported."
          action={<Button onClick={() => setVisible(true)}>Connect wallet</Button>}
        />
      </Section>
    );
  }

  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-6 pt-24 md:pt-32">
        <p className="eyebrow">Studio</p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-light italic text-ivory md:text-5xl">
            {shortenAddress(publicKey.toBase58(), 6)}
          </h1>
          <StatusPill live>Connected</StatusPill>
        </div>
      </section>

      <Section className="pt-2">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Earned" value="0 TP" hint="0 SOL" />
          <Stat label="Spent" value="0 SOL" hint="0 TP" />
          <Stat label="Claimable" value="0 TP" hint="0 SOL" />
          <Stat
            label="Active jobs"
            value={String(jobs.filter((j) => j.status !== "done").length)}
            hint={jobs.length ? `${jobs.length} on the board` : "None posted"}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Jobs</h2>
            {jobs.length === 0 ? (
              <p className="mt-6 text-sm leading-relaxed text-stone">
                Posted jobs appear here as soon as they hit the board.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
                {jobs.slice(0, 8).map((job) => (
                  <li key={job.id} className="py-4">
                    <p className="text-sm text-ivory">{job.prompt}</p>
                    <p className="mt-1 text-xs text-stone">
                      {job.status === "open"
                        ? "Open"
                        : job.status === "running"
                          ? "In work"
                          : "Done"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Settings</h2>
            <div className="mt-6 space-y-6">
              <Toggle
                label="Share only while idle"
                copy="Pause kernels when this tab is focused."
                on={settings.idleOnly}
                setOn={(idleOnly) => write({ ...settings, idleOnly })}
              />
              <Toggle
                label="Auto-claim"
                copy="Sweep rewards above a threshold when they exist."
                on={settings.autoClaim}
                setOn={(autoClaim) => write({ ...settings, autoClaim })}
              />
              <Toggle
                label="Notifications"
                copy="Job complete and pause alerts."
                on={settings.notes}
                setOn={(notes) => write({ ...settings, notes })}
              />
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-stone">Max GPU cap</span>
                  <span className="text-ivory">{settings.cap}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={settings.cap}
                  onChange={(e) => write({ ...settings, cap: Number(e.target.value) })}
                  className="w-full accent-gold"
                />
              </div>
            </div>
          </Panel>
        </div>

        <Panel className="mt-4">
          <h2 className="font-display text-2xl italic text-ivory">Transactions</h2>
          <p className="mt-6 text-sm leading-relaxed text-stone">
            No transactions. Escrow locks, payouts, and claims will list here
            with signatures when they happen.
          </p>
        </Panel>
      </Section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Panel>
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone">{label}</p>
      <p className="mt-3 font-display text-2xl italic text-ivory">{value}</p>
      <p className="mt-1 text-sm text-stone">{hint}</p>
    </Panel>
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
        <span className="block text-sm text-ivory">{label}</span>
        <span className="mt-0.5 block text-xs text-stone">{copy}</span>
      </span>
      <span className={`relative mt-0.5 h-5 w-9 border ${on ? "border-gold" : "border-ivory/20"}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 transition ${
            on ? "left-4 bg-gold" : "left-0.5 bg-ivory/40"
          }`}
        />
      </span>
    </button>
  );
}
