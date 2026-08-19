"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { useMesh } from "@/components/MeshProvider";
import { cn } from "@/lib/utils";

export function RentView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { workers, jobs, tabId, submitJob } = useMesh();
  const [prompt, setPrompt] = useState("");
  const [modelSource, setModelSource] = useState("");
  const [currency, setCurrency] = useState<"SOL" | "TP">("SOL");
  const [budget, setBudget] = useState("");

  const submit = async () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    if (!prompt.trim()) return;
    await submitJob({ prompt, modelSource, budget, currency });
    setPrompt("");
  };

  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Request</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          Run your model faster.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          Post a job to the board immediately. The next idle worker, browser
          WebGPU or a native GPU on someone’s PC, picks it up.
        </p>
      </section>

      <Section className="pt-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Post a job</h2>
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Job
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="Run Llama 8B on this prompt batch and return tokens as fast as the mesh allows."
                  className="mt-2 w-full resize-none border border-ivory/10 bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-stone/50 focus:border-gold/50"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Model source
                </span>
                <input
                  value={modelSource}
                  onChange={(e) => setModelSource(e.target.value)}
                  placeholder="Hugging Face id or https link to GGUF, ONNX, or safetensors"
                  className="mt-2 w-full border border-ivory/10 bg-transparent px-4 py-2.5 text-sm text-ivory outline-none placeholder:text-stone/50 focus:border-gold/50"
                />
                <p className="mt-2 text-xs leading-relaxed text-stone">
                  Point at a Hugging Face repo or a direct weights URL. Uploading
                  full checkpoints in the browser is a poor fit. Small prompt
                  lists belong in the job text.
                </p>
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
                {connected ? "Post to the board" : "Connect to post"}
              </Button>
            </form>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl italic text-ivory">Workers</h2>
              <StatusPill live={workers.length > 0}>
                {workers.length === 0 ? "None online" : `${workers.length} online`}
              </StatusPill>
            </div>
            {workers.length === 0 ? (
              <p className="mt-6 text-sm leading-relaxed text-stone">
                No workers yet. Share a browser tab on Earn, or download the
                native worker and run it on a PC GPU.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
                {workers.map((w) => (
                  <li key={w.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ivory">
                          {w.adapter}
                          {w.id === tabId ? " (this tab)" : ""}
                        </p>
                        <p className="mt-1 text-xs text-stone">
                          {w.kind === "native" ? "Native GPU" : "WebGPU"}
                          {w.cores != null ? ` · ${w.cores} cores` : ""}
                        </p>
                      </div>
                      <StatusPill live={w.status === "busy"}>
                        {w.status === "busy" ? "Working" : "Idle"}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-ivory">Job board</h2>
            <StatusPill live={jobs.some((j) => j.status !== "done")}>
              {jobs.length} on the board
            </StatusPill>
          </div>
          {jobs.length === 0 ? (
            <p className="mt-6 text-sm text-stone">
              Posted jobs land here at once. Idle workers take the oldest open
              job.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
              {jobs.map((job) => (
                <li key={job.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="max-w-2xl text-sm text-ivory">{job.prompt}</p>
                    <StatusPill live={job.status === "running"}>
                      {job.status === "open"
                        ? "Open"
                        : job.status === "running"
                          ? "In work"
                          : "Done"}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-xs text-stone">
                    {job.modelSource ? `${job.modelSource} · ` : ""}
                    {job.budget ? `${job.budget} ${job.currency} · ` : ""}
                    {job.workerId
                      ? `Worker ${job.workerKind === "native" ? "native GPU" : "WebGPU"}`
                      : "Waiting for an idle worker"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </Section>
    </div>
  );
}
