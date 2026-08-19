import { NextResponse } from "next/server";
import { removeWorker } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "Worker id is required" }, { status: 400 });
  }
  await removeWorker(id);
  return NextResponse.json({ ok: true });
}
