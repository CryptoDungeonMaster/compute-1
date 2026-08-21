import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/earn", label: "Earn" },
  { href: "/rent", label: "Rent" },
  { href: "/network", label: "Network" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Studio" },
];

export function Footer() {
  return (
    <footer className="border-t border-ivory/[.07] bg-[#060706]">
      <div className="mx-auto flex max-w-page flex-col gap-10 px-6 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Financial infrastructure for compute on Solana. Bring unused
            hardware to the market or rent verified execution.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] uppercase tracking-[0.2em] text-stone transition hover:text-ivory"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-page flex-col gap-2 border-t border-ivory/[.07] px-6 py-6 text-[10px] uppercase leading-relaxed tracking-[.13em] text-stone/70 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} ComputeFi</span>
        <span><i className="mr-2 not-italic text-gold">●</i>Network operational</span>
      </div>
    </footer>
  );
}
