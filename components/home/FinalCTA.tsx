"use client";

import { Button } from "@/components/ui";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-page px-6 pb-28">
      <div className="border-y border-ivory/10 py-16 text-center md:py-24">
        <p className="eyebrow">Invitation</p>
        <h2 className="mt-5 text-4xl font-medium tracking-[-.05em] text-ivory md:text-6xl">
          Put idle GPUs on a payroll.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-stone">
          Earn from a single window, or dispatch a job and pay only for verified
          output. Same mesh. Two doors.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/earn">Start earning</Button>
          <Button href="/rent" variant="secondary">
            Rent compute
          </Button>
        </div>
      </div>
    </section>
  );
}
