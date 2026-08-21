import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden border border-ivory/20 bg-[#121614] text-ivory shadow-[inset_0_0_12px_rgba(255,255,255,.07)] group-hover:border-gold/60">
        <span className="absolute bottom-0 left-0 h-px w-full bg-gold/70" />
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M14.5 3.5H6.2a3.7 3.7 0 0 0 0 7.4H12" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          <path d="M14.5 8.5H8.8a3.7 3.7 0 1 0 0 7.4h5.7" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </span>
      <span className="font-display text-[18px] font-semibold tracking-[-0.05em] text-ivory">
        Compute<span className="text-gold">Fi</span>
      </span>
    </Link>
  );
}
