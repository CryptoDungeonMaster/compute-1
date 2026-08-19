"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Lock, Upload } from "lucide-react";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { useMesh } from "@/components/MeshProvider";
import { cn } from "@/lib/utils";

export function RentView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { workers, job, tabId, submitJob } = useMesh();
  const [prompt, setPrompt] = useState("");
  const [currency, setCurrency] = useState<"SOL" | "TP">("SOL");
  const [budget, setBudget] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const submit = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    if (!prompt.trim()) return;
    submitJob({ prompt, budget, currency, fileName });
  };

  const matchedWorkers = job
    ? workers.filter((w) => job.workerIds.includes(w.id))
    : [];

  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Request</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          Run your model faster.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          Write the job in your own words. Open browser GPUs on the mesh share
          the inference so your model finishes sooner.
        </p>
      </section>

      <Section className="pt-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Your job</h2>
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  What should the mesh run
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={7}
                  placeholder="Example: Run my Llama 8B checkpoint on this batch of prompts and return tokens as fast as the open GPUs allow."
                  className="mt-2 w-full resize-none border border-ivory/10 bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-stone/50 focus:border-gold/50"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Weights or data
                </span>
                <label className="mt-2 flex cursor-pointer items-center justify-between border border-ivory/20 px-4 py-4 text-sm text-stone hover:border-gold/40">
                  <span className="inline-flex items-center gap-2">
                    <Upload size={15} />
                    {fileName ?? "Attach a file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                  />
                </label>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Budget
                </span>
                <div className="mt-2 flex border border-ivory/10">
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-ivory outline-none"
                  />
                  <div className="flex p-1">
                    {(["SOL", "TP"] as const).map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={cn(
                          "px-3 py-1.5 text-[11px] uppercase tracking-wider",
                          currency === c ? "text-gold" : "text-stone",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </label>

              <Button type="submit" className="w-full py-3" disabled={!prompt.trim()}>
                {connected ? "Send to workers" : "Connect to send"}
              </Button>
            </form>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl italic text-ivory">Workers</h2>
                <StatusPill live={workers.length > 0}>
                  {workers.length === 0
                    ? "None online"
                    : `${workers.length} online`}
                </StatusPill>
              </div>
              {workers.length === 0 ? (
                <p className="mt-6 text-sm leading-relaxed text-stone">
                  No workers online. Open Earn, connect, and start sharing. This
                  page will list that machine here.
                </p>
              ) : (
                <ul className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
                  {workers.map((w) => (
                    <li key={w.id} className="py-4">
                      <p className="text-sm text-ivory">
                        {w.adapter}
                        {w.id === tabId ? " (this tab)" : ""}
                      </p>
                      <p className="mt-1 text-xs text-stone">
                        {w.webgpu ? "WebGPU" : "CPU"}
                        {w.cores != null ? ` · ${w.cores} cores` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel id="escrow">
              <div className="flex items-start gap-3">
                <Lock size={16} className="mt-1 text-gold" />
                <div>
                  <h3 className="font-display text-xl italic text-ivory">Escrow</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    Budget locks on Solana when a job starts. Workers are paid
                    only after hashed results agree. Unused budget returns.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <Panel className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-ivory">Job status</h2>
            <StatusPill live={job?.status === "matched"}>
              {!job ? "No job" : job.status === "matched" ? "Matched" : "Waiting for workers"}
            </StatusPill>
          </div>
          {!job ? (
            <p className="mt-5 text-sm text-stone">
              Send a job after at least one tab is sharing. Status follows who
              is actually online.
            </p>
          ) : job.status === "matched" ? (
            <p className="mt-5 text-sm leading-relaxed text-stone">
              Your job is matched to {matchedWorkers.length} worker
              {matchedWorkers.length === 1 ? "" : "s"}
              {job.budget ? ` for ${job.budget} ${job.currency}` : ""}.
              {matchedWorkers[0]
                ? ` Running on ${matchedWorkers.map((w) => w.adapter).join(", ")}.`
                : ""}
            </p>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-stone">
              Waiting for a worker. Open Earn, connect, and start sharing. This
              page matches as soon as a machine appears.
            </p>
          )}
        </Panel>
      </Section>
    </div>
  );
}
