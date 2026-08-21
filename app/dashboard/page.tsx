import { PageShell } from "@/components/PageShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata = {
  title: "Studio · ComputeFi",
  description:
    "Overview of ComputeFi earnings, spending, jobs, transaction history, and worker settings.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardView />
    </PageShell>
  );
}
