import { PageShell } from "@/components/PageShell";
import { RentView } from "@/components/rent/RentView";

export const metadata = {
  title: "Rent · Tap Power",
  description:
    "Pay in SOL or TP to run AI inference, rendering, and data jobs across the Tap Power browser mesh.",
};

export default function RentPage() {
  return (
    <PageShell>
      <RentView />
    </PageShell>
  );
}
