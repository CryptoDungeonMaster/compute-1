"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Lock, Upload } from "lucide-react";
import { Button, Panel, Section, StatusPill } from "@/components/ui";
import { cn } from "@/lib/utils";

const TASKS = [
  "AI Inference",
  "Image Rendering",
  "Data Processing",
  "Custom Kernel",
] as const;

export function RentView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [task, setTask] = useState<(typeof TASKS)[number]>("AI Inference");
  const [prompt, setPrompt] = useState("");
  const [currency, setCurrency] = useState<"SOL" | "PF">("SOL");
  const [budget, setBudget] = useState("");
  const [priority, setPriority] = useState<"Fast" | "Standard" | "Economy">(
    "Standard",
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div>
      <section className="mx-auto max-w-page px-6 pb-10 pt-24 md:pt-32">
        <p className="eyebrow">Request</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light italic leading-[1.1] text-ivory md:text-6xl">
          Commission the mesh. Pay for verified work.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">
          Describe the job and lock a budget. Matching begins when workers are
          online. Nothing is charged until escrow can settle.
        </p>
      </section>

      <Section className="pt-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel>
            <h2 className="font-display text-2xl italic text-ivory">Compose a job</h2>
            <form
              className="mt-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Task
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TASKS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setTask(item)}
                      className={cn(
                        "border px-3 py-2.5 text-left text-sm transition",
                        task === item
                          ? "border-gold/60 text-ivory"
                          : "border-ivory/10 text-stone hover:border-ivory/25",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Instructions
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="Describe the work. Be specific about output, size, and constraints."
                  className="mt-2 w-full resize-none border border-ivory/10 bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-stone/50 focus:border-gold/50"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  Data
                </span>
                <label className="mt-2 flex cursor-pointer items-center justify-between border border-dashed border-ivory/20 px-4 py-4 text-sm text-stone hover:border-gold/40">
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

              <div className="grid gap-4 sm:grid-cols-2">
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
                      {(["SOL", "PF"] as const).map((c) => (
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
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                    Priority
                  </span>
                  <div className="mt-2 grid grid-cols-3 border border-ivory/10">
                    {(["Fast", "Standard", "Economy"] as const).map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setPriority(item)}
                        className={cn(
                          "py-2.5 text-[11px] uppercase tracking-wider",
                          priority === item ? "text-ivory" : "text-stone",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <Button type="submit" className="w-full py-3">
                {connected ? "Queue job" : "Connect to queue"}
              </Button>
            </form>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl italic text-ivory">Workers</h2>
                <StatusPill>None online</StatusPill>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-stone">
                No workers online. Machines will list here with adapter class
                and price when providers are sharing.
              </p>
            </Panel>

            <Panel id="escrow">
              <div className="flex items-start gap-3">
                <Lock size={16} className="mt-1 text-gold" />
                <div>
                  <h3 className="font-display text-xl italic text-ivory">Escrow</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    Budget locks on Solana when a job starts. Workers are paid
                    only after hashed results agree. Unused budget returns.
                    No funds move until the mesh can match.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        <Panel className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl italic text-ivory">Job status</h2>
            <StatusPill live={submitted}>{submitted ? "Queued locally" : "No job"}</StatusPill>
          </div>
          {submitted ? (
            <p className="mt-5 text-sm leading-relaxed text-stone">
              {task} is held as a local request
              {budget ? ` for ${budget} ${currency}` : ""}. Matching and escrow
              begin when workers are on the mesh. Nothing has been charged.
            </p>
          ) : (
            <p className="mt-5 text-sm text-stone">
              Submit a job to place a request. Status will reflect the chain,
              not a simulation.
            </p>
          )}
        </Panel>
      </Section>
    </div>
  );
}
