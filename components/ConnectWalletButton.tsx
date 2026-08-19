"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Copy, LogOut, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export function ConnectWalletButton({
  label = "Connect Wallet",
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

  if (!mounted) {
    return (
      <button
        className={`inline-flex h-10 items-center rounded-full bg-white/5 px-4 text-sm text-white/70 ring-1 ring-white/10 ${className ?? ""}`}
      >
        Connect Wallet
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        disabled={connecting}
        className={`inline-flex items-center gap-2 rounded-full bg-accent-blue px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-[#2563eb] disabled:opacity-60 ${className ?? ""}`}
      >
        <Wallet size={15} />
        {connecting ? (
          "Connecting…"
        ) : label === "Connect Wallet" ? (
          <>
            <span className="md:hidden">Connect</span>
            <span className="hidden md:inline">Connect Wallet</span>
          </>
        ) : (
          label
        )}
      </button>
    );
  }

  const address = publicKey.toBase58();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10 transition hover:bg-white/10 ${className ?? ""}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent-green shadow-[0_0_8px_#22C55E]" />
        {shortenAddress(address)}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0d] p-1 shadow-glass">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            onClick={async () => {
              await navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            <Copy size={14} />
            {copied ? "Copied" : "Copy address"}
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5"
            onClick={() => {
              setOpen(false);
              disconnect();
            }}
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}
