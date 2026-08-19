import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="grid h-8 w-8 place-items-center border border-ivory/20">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M1 3.2h12" stroke="#C4A574" strokeWidth="1.1" />
          <path d="M7 3.2v8.2" stroke="#EDE6D6" strokeWidth="1.1" />
        </svg>
      </span>
      <span className="font-display text-[19px] font-light tracking-[0.04em] text-ivory">
        Tap <span className="italic text-ivory/75">Power</span>
      </span>
    </Link>
  );
}
