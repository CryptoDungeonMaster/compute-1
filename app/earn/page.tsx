import { PageShell } from "@/components/PageShell";
import { EarnView } from "@/components/earn/EarnView";

export const metadata = {
  title: "Earn · Tap Power",
  description:
    "Connect a Solana wallet, keep a tab open, and earn SOL by completing approved compute jobs.",
};

export default function EarnPage() {
  return (
    <PageShell>
      <EarnView />
    </PageShell>
  );
}
