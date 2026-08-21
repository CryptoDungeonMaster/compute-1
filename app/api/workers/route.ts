import { NextResponse } from "next/server";
import { listWorkers, usingMongo } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const workers = await listWorkers();
  const visible = workers.map(({ authToken, wallet, ...worker }) => worker);
  return NextResponse.json({ workers: visible, mongo: usingMongo() });
}
