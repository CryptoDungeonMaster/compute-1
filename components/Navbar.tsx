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
  { href: "/token", label: "Token" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-white/8 bg-[#050505]/75 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <ConnectWalletButton />
          </div>
          <button
            className="absolute right-4 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/8 bg-[#050505]/95 px-6 py-5 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2.5 text-white/80 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <ConnectWalletButton className="w-full justify-center" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
