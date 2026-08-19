import { PageShell } from "@/components/PageShell";
import { RentView } from "@/components/rent/RentView";

export const metadata = {
  title: "Rent · Tap Power",
  description:
    "Pay in SOL to run approved AI inference, rendering, and data jobs through the Tap Power worker board.",
};

export default function RentPage() {
  return (
    <PageShell>
      <RentView />
    </PageShell>
  );
}
