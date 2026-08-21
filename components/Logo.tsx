import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden border border-ivory/20 bg-[#060706] shadow-[inset_0_0_12px_rgba(255,255,255,.07)] transition-colors group-hover:border-gold/60">
        <Image src="/logo.png" alt="" width={36} height={36} className="scale-[1.65]" priority />
      </span>
      <span className="font-display text-[18px] font-semibold tracking-[-0.05em] text-ivory">
        Compute<span className="text-gold">Fi</span>
      </span>
    </Link>
  );
}
