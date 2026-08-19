"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Upload, Zap } from "lucide-react";
import {
  Button,
  GlassCard,
  ProgressBar,
  Section,
  StatusPill,
} from "@/components/ui";
import { WORKERS } from "@/lib/mock";
import { cn } from "@/lib/utils";

const TASKS = [
  "AI Inference",
  "Image Rendering",
  "Data Processing",
  "Custom Kernel",
] as const;

const STAGES = [
  "Queued",
  "Matching",
  "Escrow locked",
  "Computing",
  "Verifying",
  "Complete",
] as const;

export function RentView() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [task, setTask] = useState<(typeof TASKS)[number]>("AI Inference");
  const [prompt, setPrompt] = useState("");
  const [currency, setCurrency] = useState<"SOL" | "PF">("SOL");
  const [budget, setBudget] = useState("1.5");
  const [priority, setPriority] = useState<"Fast" | "Standard" | "Economy">(
    "Standard",
  );
  const [stage, setStage] = useState(-1);
  const [selected, setSelected] = useState<string[]>(["w1", "w2"]);
  const [fileName, setFileName] = useState<string | null>(null);

  const running = stage >= 0 && stage < STAGES.length - 1;
  const complete = stage === STAGES.length - 1;

  const submit = () => {
    if (!connected) {
      setVisible(true);
      return;
    }
    setStage(0);
    STAGES.forEach((_, i) => {
      window.setTimeout(() => setStage(i), i * 1100);
    });
  };

  const selectedWorkers = useMemo(
    () => WORKERS.filter((w) => selected.includes(w.id)),
    [selected],
  );

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-16 md:pt-24">
        <p className="eyebrow">Requester</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Rent a constellation of browsers.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/60">
          Describe the job, lock a budget in SOL or PF, and the mesh matches
          live WebGPU workers. Escrow releases only after verification.
        </p>
      </section>

      <Section className="pt-4 md:pt-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard>
            <h2 className="font-display text-xl text-white">Submit a job</h2>
            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Task type
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TASKS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setTask(item)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm ring-1 transition",
                        task === item
                          ? "bg-accent-blue/15 text-white ring-accent-blue/40"
                          : "bg-white/4 text-white/65 ring-white/8 hover:bg-white/8",
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Prompt or instructions
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="e.g. Run SDXL turbo, 12 stills, 1024², cinematic lighting…"
                  className="mt-2 w-full resize-none rounded-xl bg-white/4 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-accent-blue/50"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                  Upload data
                </span>
                <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/3 px-4 py-4 text-sm text-white/60 hover:border-white/30">
                  <span className="inline-flex items-center gap-2">
                    <Upload size={16} />
                    {fileName ?? "Drop a file or browse"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name ?? null)
                    }
                  />
                </label>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Budget
                  </span>
                  <div className="mt-2 flex overflow-hidden rounded-xl ring-1 ring-white/10">
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-white/4 px-4 py-2.5 text-sm text-white outline-none"
                    />
                    <div className="flex bg-white/5 p-1">
                      {(["SOL", "PF"] as const).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium",
                            currency === c
                              ? "bg-white/10 text-white"
                              : "text-white/45",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {currency === "PF" ? (
                    <p className="mt-1.5 text-xs text-accent-green">
                      PF payments include a 5% protocol discount.
                    </p>
                  ) : null}
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">
                    Priority
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-white/4 p-1 ring-1 ring-white/10">
                    {(["Fast", "Standard", "Economy"] as const).map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setPriority(item)}
                        className={cn(
                          "rounded-lg py-2 text-xs font-medium transition",
                          priority === item
                            ? "bg-white/10 text-white"
                            : "text-white/45 hover:text-white",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <Button type="submit" className="w-full py-3" disabled={running}>
                <Zap size={15} />
                {running ? "Job in flight…" : "Lock escrow & run"}
              </Button>
            </form>
          </GlassCard>

          <div className="space-y-4">
            <GlassCard className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="font-display text-xl text-white">
                  Available workers
                </h2>
                <StatusPill tone="green">{WORKERS.length} live</StatusPill>
              </div>
              <ul className="divide-y divide-white/6">
                {WORKERS.map((w) => {
                  const on = selected.includes(w.id);
                  return (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setSelected((prev) =>
                            on
                              ? prev.filter((id) => id !== w.id)
                              : [...prev, w.id],
                          )
                        }
                        className="flex w-full items-start justify-between gap-3 px-6 py-4 text-left hover:bg-white/4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white">{w.name}</p>
                            <StatusPill tone={on ? "blue" : "muted"}>
                              {on ? "Selected" : w.region}
                            </StatusPill>
                          </div>
                          <p className="mt-1 text-xs text-white/45">
                            {w.gpu} · {w.latencyMs}ms · {w.uptime}% uptime
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-white">{w.rateSol.toFixed(4)} SOL/min</p>
                          <p className="text-xs text-white/40">{w.ratePf} PF/min</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>

            <GlassCard id="escrow">
              <div className="flex items-start gap-3">
                <Lock size={18} className="mt-0.5 text-accent-purple" />
                <div>
                  <h3 className="font-display text-lg text-white">
                    Escrow and payment
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Your budget is locked in a Solana escrow when the job
                    starts. Workers are paid from that vault only after hashed
                    results agree. Unused budget returns automatically.
                    {selectedWorkers.length
                      ? ` ${selectedWorkers.length} worker${selectedWorkers.length > 1 ? "s" : ""} currently selected.`
                      : " Select at least one worker, or let the matcher pick."}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-white">Live job status</h2>
            <StatusPill
              tone={complete ? "green" : stage >= 0 ? "blue" : "muted"}
            >
              {stage < 0 ? "Waiting for a job" : STAGES[stage]}
            </StatusPill>
          </div>
          {stage < 0 ? (
            <p className="mt-4 text-sm text-white/45">
              Submit a job to watch matching, escrow, compute, and verification
              play out in real time.
            </p>
          ) : (
            <div className="mt-8">
              <ProgressBar
                value={((stage + 1) / STAGES.length) * 100}
                tone={complete ? "green" : "blue"}
              />
              <ol className="mt-6 grid gap-3 md:grid-cols-6">
                {STAGES.map((label, i) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[11px] ring-1",
                        i <= stage
                          ? "bg-accent-blue/20 text-white ring-accent-blue/40"
                          : "bg-white/5 text-white/35 ring-white/10",
                      )}
                    >
                      {i < stage || complete ? <Check size={12} /> : i + 1}
                    </span>
                    <span className={i <= stage ? "text-white" : "text-white/35"}>
                      {label}
                    </span>
                  </li>
                ))}
              </ol>
              <AnimatePresence>
                {complete ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-sm text-accent-green"
                  >
                    Output verified. Escrow released to {selected.length || 3}{" "}
                    workers. Receipt is in your dashboard.
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </Section>
    </div>
  );
}
