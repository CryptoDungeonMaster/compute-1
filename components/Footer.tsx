import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/earn", label: "Earn" },
  { href: "/rent", label: "Rent" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Studio" },
];

export function Footer() {
  return (
    <footer className="border-t border-ivory/10">
      <div className="mx-auto flex max-w-page flex-col gap-10 px-6 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Browser compute on Solana. Open a tab, share idle silicon, or rent
            the mesh. WebGPU only.
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
      <div className="mx-auto max-w-page border-t border-ivory/10 px-6 py-6 text-[11px] leading-relaxed tracking-wide text-stone/70">
        Tap Power is experimental. Digital assets carry risk. Verify contracts
        independently. Never share a seed phrase.
        <span className="mt-2 block">© {new Date().getFullYear()} Tap Power</span>
      </div>
    </footer>
  );
}
