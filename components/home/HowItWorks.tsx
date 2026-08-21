"use client";

import { Section } from "@/components/ui";

const STEPS = [
  ["01", "Fund", "The renter defines the work and locks a chosen SOL reward in escrow."],
  ["02", "Compute", "One or more eligible workers process the job while payment stays locked."],
  ["03", "Verify", "The completed result closes the task and records its execution proof."],
  ["04", "Settle", "The worker share becomes claimable only after successful completion."],
];

export function HowItWorks() {
  return <Section id="how" className="py-24 md:py-32">
    <div className="flex flex-col justify-between gap-6 border-t border-ivory/10 pt-8 md:flex-row md:items-end"><div><p className="eyebrow">The settlement path</p><h2 className="mt-4 max-w-2xl text-4xl font-medium leading-[1.04] tracking-[-.05em] text-ivory md:text-6xl">Work first.<br/>Payment after proof.</h2></div><p className="max-w-sm text-sm leading-relaxed text-stone">The network separates funding from settlement. Workers can collaborate when a larger task benefits from parallel capacity.</p></div>
    <ol className="mt-12 grid border-y border-ivory/10 md:grid-cols-4">{STEPS.map(([number, title, copy], index) => <li key={number} className={`py-6 md:px-6 ${index ? "border-t border-ivory/10 md:border-l md:border-t-0" : ""}`}><p className="font-mono text-[9px] tracking-[.18em] text-gold">{number}</p><h3 className="mt-3 text-base font-medium text-ivory">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone">{copy}</p></li>)}</ol>
  </Section>;
}
