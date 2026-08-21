import { NextResponse } from "next/server";
import { verifyAdminChallenge } from "@/lib/admin";
import { listJobs, listLedger, listWorkers, usingMongo } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { wallet, message, signature, token } = await req.json().catch(() => ({}));
  if (typeof wallet !== "string" || typeof message !== "string" || typeof signature !== "string" || typeof token !== "string" || !verifyAdminChallenge(wallet, message, signature, token)) return NextResponse.json({ error: "Administrator signature required." }, { status: 403 });
  const [workers, jobs, ledger] = await Promise.all([listWorkers(), listJobs(), listLedger()]);
  const wallets = Array.from(new Set([...workers.map((w) => w.wallet), ...jobs.map((j) => j.wallet), ...ledger.map((entry) => entry.wallet)].filter((value): value is string => Boolean(value))));
  return NextResponse.json({ workers, jobs, ledger, wallets, mongo: usingMongo() });
}
