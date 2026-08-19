import { PageShell } from "@/components/PageShell";
import { TokenView } from "@/components/token/TokenView";

export const metadata = {
  title: "Token — TabPower",
  description:
    "How the TabPower PF token works with SOL: utility, payments, tokenomics, staking, and fee share.",
};

export default function TokenPage() {
  return (
    <PageShell>
      <TokenView />
    </PageShell>
  );
}
