"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Coins, Radio, Sparkles } from "lucide-react";
import { Section, SectionHeading, StatusPill } from "@/components/ui";
import { useLiveNetwork } from "@/components/LiveNetwork";
import { timeAgo } from "@/lib/utils";
import { useMounted } from "@/hooks/useMounted";

const ICONS = {
  earn: Coins,
  job: Sparkles,
  join: Radio,
  claim: Activity,
};

const TONES = {
  earn: "green" as const,
  job: "blue" as const,
  join: "purple" as const,
  claim: "muted" as const,
};

export function ActivityFeed() {
  const { activity, jobsPerMin, workers } = useLiveNetwork();
  const mounted = useMounted();

  return (
    <Section>
      <SectionHeading
        eyebrow="Live mesh"
        title="The network never sits still."
        copy="A rolling view of workers joining, jobs clearing, and rewards landing. Mock traffic so the product feels alive the moment you open it."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <p className="text-sm text-white/70">Activity</p>
            <StatusPill tone="green">Streaming</StatusPill>
          </div>
          <ul className="divide-y divide-white/6">
            <AnimatePresence initial={false}>
              {activity.slice(0, 6).map((item) => {
                const Icon = ICONS[item.type];
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 px-5 py-4"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/70">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-white">{item.title}</p>
                        <StatusPill tone={TONES[item.type]}>{item.type}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-white/45">
                        {item.actor} · {item.detail}
                        {mounted ? ` · ${timeAgo(item.createdAt)}` : ""}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Throughput
            </p>
            <p className="mt-3 font-display text-4xl text-white">
              {Math.round(jobsPerMin)}
              <span className="ml-2 text-lg text-white/40">jobs/min</span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              Average match time across the last 15 minutes is 2.4 seconds.
            </p>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              Capacity
            </p>
            <p className="mt-3 font-display text-4xl text-white">
              {Math.round(workers).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-white/50">
              Open tabs advertising WebGPU, sampled every few seconds.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
