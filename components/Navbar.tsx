"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/earn", label: "Earn" },
  { href: "/rent", label: "Rent" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Studio" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "border-b border-ivory/10 bg-ink/80 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-page items-center justify-between gap-4 px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.22em] transition",
                  active ? "text-ivory" : "text-stone hover:text-ivory",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>
          <button
            className="relative z-50 flex h-10 w-10 shrink-0 items-center justify-center border border-ivory/25 text-ivory md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-ivory/10 bg-ink px-6 py-6 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-[12px] uppercase tracking-[0.2em] text-ivory/80"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4">
                <ConnectWalletButton className="w-full justify-center" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
