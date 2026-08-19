"use client";

import { formatCompact, formatNumber } from "@/lib/utils";
import { useLiveNetwork } from "@/components/LiveNetwork";

export function NetworkStatus() {
  const { workers, jobsPerMin } = useLiveNetwork();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 hidden md:block">
      <div className="pointer-events-auto glass-strong flex items-center gap-3 rounded-full px-3.5 py-2 text-xs text-white/80 shadow-glass">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
        </span>
        <span className="font-medium text-white">Live network</span>
        <span className="text-white/25">|</span>
        <span>{formatNumber(Math.round(workers))} workers</span>
        <span className="text-white/25">|</span>
        <span>{formatCompact(jobsPerMin, 0)} jobs/min</span>
      </div>
    </div>
  );
}
