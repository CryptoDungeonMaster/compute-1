"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Copy, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function ConnectWalletButton({
  label = "Connect",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const base =
    "inline-flex h-10 items-center justify-center gap-2 border px-4 text-[11px] uppercase tracking-[0.18em] transition";

  if (!mounted) {
    return (
      <button className={cn(base, "border-ivory/20 text-ivory/60", className)}>
        Connect
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className={cn(base, "border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-50", className)}
      >
        {connecting ? "Connecting" : label}
      </button>
    );
  }

  const address = publicKey.toBase58();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(base, "border-ivory/20 text-ivory hover:border-gold/60", className)}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        {shortenAddress(address)}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-48 border border-ivory/15 bg-ink p-1">
          <button
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-ivory/80 hover:bg-ivory/5"
            onClick={async () => {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            <Copy size={13} />
            {copied ? "Copied" : "Copy address"}
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-ivory/80 hover:bg-ivory/5"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
          >
            <LogOut size={13} />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
