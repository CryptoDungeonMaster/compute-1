import { NextResponse } from "next/server";
import { listWorkers, usingMongo } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const workers = await listWorkers();
  const visible = workers.map((worker) =>
    Object.fromEntries(Object.entries(worker).filter(([key]) => key !== "authToken" && key !== "wallet")),
  );
  return NextResponse.json({ workers: visible, mongo: usingMongo() });
}
