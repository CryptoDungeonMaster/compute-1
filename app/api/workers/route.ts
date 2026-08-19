import { NextResponse } from "next/server";
import { listWorkers, usingMongo } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const workers = await listWorkers();
  return NextResponse.json({ workers, mongo: usingMongo() });
}
