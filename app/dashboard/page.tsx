import { PageShell } from "@/components/PageShell";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata = {
  title: "Studio · Tap Power",
  description:
    "Overview of Tap Power earnings, spending, jobs, transaction history, and worker settings.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <DashboardView />
    </PageShell>
  );
}
