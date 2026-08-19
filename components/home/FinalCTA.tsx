"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/8 via-[#0a0a0c] to-[#050505] px-8 py-14 text-center md:px-16">
        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-accent-blue/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-accent-green/20 blur-3xl" />
        <p className="eyebrow">Ready when your tab is</p>
        <h2 className="relative mt-3 font-display text-3xl font-semibold text-white md:text-5xl">
          Put idle GPUs on a payroll.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-white/60">
          Start earning from a single browser window, or spin up a job and pay
          only for verified output. Same mesh. Two doors.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/earn" variant="green" className="px-6 py-3">
            Start Earning
            <ArrowRight size={16} />
          </Button>
          <Button href="/rent" variant="secondary" className="px-6 py-3">
            Rent Compute
          </Button>
        </div>
      </div>
    </section>
  );
}
