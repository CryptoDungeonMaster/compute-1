"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Download, Pause, Play } from "lucide-react";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useMesh } from "@/components/MeshProvider";

export function EarnView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { device, sharing, startSharing, stopSharing, assignedJob } = useMesh();

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
          Share a tab, or run a worker on your PC.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          Browser WebGPU is one option. For a real GPU, download the native
          worker and leave it running. Open jobs on the board are assigned to
          idle machines.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ConnectWalletButton label="Connect wallet" />
          <Button variant={sharing ? "secondary" : "primary"} onClick={toggleShare}>
            {sharing ? <Pause size={14} /> : <Play size={14} />}
            {sharing ? "Stop browser share" : "Share this tab"}
          </Button>
          <a
            href="/tap-power-worker.mjs"
            download
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-ivory/20 px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-ivory transition-colors hover:border-gold/70 hover:text-gold"
          >
            <Download size={14} />
            Download PC worker
          </a>
        </div>
      </section>

      <Section className="pt-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-ivory">This tab</h2>
              <StatusPill live={sharing}>{sharing ? "Sharing WebGPU" : "Idle"}</StatusPill>
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
            </dl>
            <p className="mt-8 text-sm leading-relaxed text-stone">
              Keep this tab open while sharing. It shows up as a WebGPU worker
              on Rent and takes an open job when idle.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">PC worker</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">
              Uses NVIDIA via nvidia-smi when present, otherwise reports the
              CPU. Run it anywhere Node is installed.
            </p>
            <pre className="mt-6 overflow-x-auto border border-ivory/10 p-4 text-xs leading-relaxed text-ivory/80">
{`node tap-power-worker.mjs`}
            </pre>
            <p className="mt-4 text-xs leading-relaxed text-stone">
              Optional: TAP_POWER_URL for your site origin, TAP_POWER_WALLET
              for the Solana address to credit.
            </p>
          </Panel>
        </div>

        <Panel className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-ivory">Work on this</h2>
            <StatusPill live={Boolean(assignedJob)}>
              {assignedJob ? "Assigned" : "Idle"}
            </StatusPill>
          </div>
          {assignedJob ? (
            <div className="mt-6">
              <p className="text-sm text-ivory">{assignedJob.prompt}</p>
              {assignedJob.modelSource ? (
                <p className="mt-2 text-xs text-stone">{assignedJob.modelSource}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-stone">
              When a job is on the board and this worker is idle, it is assigned
              here automatically.
            </p>
          )}
        </Panel>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric label="Available" value="0 TP" hint="0 SOL" />
          <Metric label="Earned today" value="0 TP" hint="No settlements yet" />
          <Metric label="Lifetime" value="0 TP" hint="No jobs completed" />
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
