"use client";

import { useMemo, type ComponentType, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import type { Adapter } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const Connection = ConnectionProvider as ComponentType<{
  endpoint: string;
  children?: ReactNode;
}>;
const Wallet = WalletProvider as ComponentType<{
  wallets: Adapter[];
  autoConnect?: boolean;
  children?: ReactNode;
}>;
const Modal = WalletModalProvider as ComponentType<{ children?: ReactNode }>;

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("mainnet-beta"),
    [],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <Connection endpoint={endpoint}>
      <Wallet wallets={wallets} autoConnect>
        <Modal>{children}</Modal>
      </Wallet>
    </Connection>
  );
}
