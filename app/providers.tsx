"use client";

import { WalletProviders } from "@/components/WalletProviders";
import { LiveNetworkProvider } from "@/components/LiveNetwork";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <LiveNetworkProvider>{children}</LiveNetworkProvider>
    </WalletProviders>
  );
}
