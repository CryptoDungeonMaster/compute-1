import { NextResponse } from "next/server";
import { listJobs, listLedger, listWorkers } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [workers, jobs, ledger] = await Promise.all([listWorkers(), listJobs(), listLedger()]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const settledLamports = ledger.filter((entry) => entry.kind === "payout").reduce((total, entry) => total + entry.lamports, 0);
  return NextResponse.json({ workers: workers.length, jobsToday: jobs.filter((job) => job.createdAt >= today.getTime()).length, settledSol: settledLamports / 1_000_000_000, capacity: null });
}
