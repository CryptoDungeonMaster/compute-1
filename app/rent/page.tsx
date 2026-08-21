import { PageShell } from "@/components/PageShell";
import { RentView } from "@/components/rent/RentView";

export const metadata = {
  title: "Rent · ComputeFi",
  description:
    "Deploy verified AI inference, rendering, and data workloads across the ComputeFi network.",
};

export default function RentPage() {
  return (
    <PageShell>
      <RentView />
    </PageShell>
  );
}
