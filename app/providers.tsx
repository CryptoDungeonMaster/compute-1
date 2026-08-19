"use client";

import { WalletProviders } from "@/components/WalletProviders";
import { MeshProvider } from "@/components/MeshProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProviders>
      <MeshProvider>{children}</MeshProvider>
    </WalletProviders>
  );
}
