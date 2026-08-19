import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-xl bg-ink-900 ring-1 ring-white/10">
        <span className="absolute inset-0 bg-gradient-to-br from-accent-blue/40 via-transparent to-accent-green/30" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4.5 w-4.5 text-white"
          width="18"
          height="18"
          fill="none"
          aria-hidden
        >
          <path
            d="M7 8.5h10a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 17 18.5H7A1.5 1.5 0 0 1 5.5 17V10A1.5 1.5 0 0 1 7 8.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M8 6.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M12 11.2v5.2M12 11.2l2.1 1.4M12 11.2 9.9 12.6"
            stroke="#22C55E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-white">
        Tab<span className="text-white/90">Power</span>
      </span>
    </Link>
  );
}
