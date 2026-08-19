import { PageShell } from "@/components/PageShell";
import { RentView } from "@/components/rent/RentView";

export const metadata = {
  title: "Rent Compute — TabPower",
  description:
    "Pay in SOL or PF to run AI inference, rendering, and data jobs across the TabPower browser mesh.",
};

export default function RentPage() {
  return (
    <PageShell>
      <RentView />
    </PageShell>
  );
}
