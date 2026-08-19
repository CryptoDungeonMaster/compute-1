import Link from "next/link";
import { Logo } from "@/components/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/earn", label: "Earn" },
      { href: "/rent", label: "Rent compute" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/token", label: "Token" },
    ],
  },
  {
    title: "Network",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/earn#verify", label: "Verification" },
      { href: "/rent#escrow", label: "Escrow" },
      { href: "/token#utility", label: "Economics" },
    ],
  },
  {
    title: "Socials",
    links: [
      { href: "https://x.com", label: "X" },
      { href: "https://discord.com", label: "Discord" },
      { href: "https://github.com", label: "GitHub" },
      { href: "https://t.me", label: "Telegram" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-8 border-t border-white/8">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
            Browser-native compute on Solana. Share unused CPU and GPU from a
            tab — or rent the mesh to run jobs. WebGPU only. No downloads.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl border-t border-white/8 px-6 py-6 pb-20 text-xs leading-relaxed text-white/35 md:pb-6">
        <p>
          TabPower is experimental software. Cryptocurrency and compute markets
          involve risk. Network stats and activity in this interface are
          simulated for demonstration. Always verify smart contracts and never
          share your seed phrase.
        </p>
        <p className="mt-3">© {new Date().getFullYear()} TabPower. All rights reserved.</p>
      </div>
    </footer>
  );
}
