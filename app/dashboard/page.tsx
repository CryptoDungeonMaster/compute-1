import { PageShell } from "@/components/PageShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata = {
  title: "Dashboard — TabPower",
  description:
    "Overview of TabPower earnings, spending, active jobs, transaction history, and worker settings.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardView />
    </PageShell>
  );
}
