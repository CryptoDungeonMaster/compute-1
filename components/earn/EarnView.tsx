"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Pause, Play } from "lucide-react";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useMesh } from "@/components/MeshProvider";

export function EarnView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { device, sharing, startSharing, stopSharing } = useMesh();

  const toggleShare = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    if (sharing) stopSharing();
    else startSharing();
  };

  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Provide</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          Connect, leave the tab open, share what sits idle.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          This browser reports its own adapter. While you share, it appears on
          the Rent page as a worker. Earnings show after verified work settles
          to your wallet.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ConnectWalletButton label="Connect wallet" />
          <Button variant={sharing ? "secondary" : "primary"} onClick={toggleShare}>
            {sharing ? <Pause size={14} /> : <Play size={14} />}
            {sharing ? "Stop sharing" : "Start sharing"}
          </Button>
        </div>
      </section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Available" value="0 TP" hint="0 SOL" />
          <Metric label="Earned today" value="0 TP" hint="No settlements yet" />
          <Metric label="Lifetime" value="0 TP" hint="No jobs completed" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-ivory">This machine</h2>
              <StatusPill live={sharing}>{sharing ? "Sharing" : "Idle"}</StatusPill>
            </div>
            <dl className="mt-8 space-y-5 text-sm">
              <Row
                label="WebGPU"
                value={device ? (device.webgpu ? "Available" : "Unavailable") : "Reading"}
              />
              <Row label="Adapter" value={device?.label ?? "Reading"} />
              <Row
                label="Logical cores"
                value={device?.cores != null ? String(device.cores) : "Unknown"}
              />
              <Row
                label="Status"
                value={sharing ? "Visible on Rent as a worker" : "Not sharing"}
              />
            </dl>
            <p className="mt-8 text-sm leading-relaxed text-stone">
              Adapter details come from this browser. Keep this tab open while
              sharing so the Rent page can see you.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Claim</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              Nothing to claim until verified work pays this address.
            </p>
            <div className="mt-8 border border-ivory/10 px-5 py-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone">Available</p>
              <p className="mt-2 font-display text-3xl italic text-ivory">0 TP</p>
              <p className="text-stone">0 SOL</p>
            </div>
            <Button className="mt-6 w-full" disabled>
              Claim rewards
            </Button>
          </Panel>
        </div>

        <Panel className="mt-4">
          <h2 className="font-display text-2xl italic text-ivory">History</h2>
          <p className="mt-6 text-sm leading-relaxed text-stone">
            No earnings yet. Completed jobs will list here with amounts,
            signatures, and verification status.
          </p>
        </Panel>

        <div id="verify" className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Verification</p>
            <h2 className="mt-4 font-display text-3xl font-light italic text-ivory md:text-4xl">
              Redundant slices. Hashed results.
            </h2>
            <p className="mt-5 leading-relaxed text-stone">
              Jobs split across independent tabs. Outputs hash, compare, then
              release from escrow. A mismatch pauses the outlier. It does not
              drain the requester.
            </p>
          </div>
          <ul className="space-y-0 border-y border-ivory/10">
            {[
              "Kernels run in a sandboxed worker thread",
              "Quorum of independent tabs per slice",
              "Result hash posted on Solana before payout",
              "Repeat mismatches pause the device",
            ].map((line) => (
              <li
                key={line}
                className="border-b border-ivory/10 py-4 text-sm text-ivory/80 last:border-b-0"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Panel>
      <p className="text-[10px] uppercase tracking-[0.2em] text-stone">{label}</p>
      <p className="mt-3 font-display text-3xl italic text-ivory">{value}</p>
      <p className="mt-1 text-sm text-stone">{hint}</p>
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-ivory/10 pb-4 last:border-0 last:pb-0">
      <dt className="text-stone">{label}</dt>
      <dd className="max-w-[60%] text-right text-ivory">{value}</dd>
    </div>
  );
}
