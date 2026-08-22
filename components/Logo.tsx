import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden">
        <Image src="/logo.png" alt="" width={36} height={36} className="scale-[1.65]" priority />
      </span>
      <span className="font-display text-[18px] font-semibold tracking-[-0.05em] text-ivory">
        Compute<span className="text-gold">Fi</span>
      </span>
    </Link>
  );
}
