"use client";

import { formatCompact, formatNumber } from "@/lib/utils";
import { useLiveNetwork } from "@/components/LiveNetwork";
import { GlassCard } from "@/components/ui";

export function StatsBar() {
  const { workers, computeHours, tokens } = useLiveNetwork();

  const stats = [
    {
      label: "Active workers",
      value: formatNumber(Math.round(workers)),
      hint: "Browsers sharing now",
    },
    {
      label: "Total compute shared",
      value: `${formatCompact(computeHours)} hrs`,
      hint: "GPU + CPU time",
    },
    {
      label: "Tokens distributed",
      value: `${formatCompact(tokens)} PF`,
      hint: "Worker rewards paid",
    },
  ];

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6">
      <div className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="px-6 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl text-white md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-white/45">{stat.hint}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
