"use client";

import { WalletProviders } from "@/components/WalletProviders";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProviders>{children}</WalletProviders>;
}
