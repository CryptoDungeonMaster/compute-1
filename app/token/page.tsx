import { PageShell } from "@/components/PageShell";
import { TokenView } from "@/components/token/TokenView";

export const metadata = {
  title: "Token · Tap Power",
  description:
    "How the Tap Power TP token works with SOL: utility, payments, staking, and fee share.",
};

export default function TokenPage() {
  return (
    <PageShell>
      <TokenView />
    </PageShell>
  );
}
