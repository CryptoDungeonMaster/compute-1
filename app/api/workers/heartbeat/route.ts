import { NextResponse } from "next/server";
import { heartbeat } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "Worker id is required" }, { status: 400 });
  }
  const result = await heartbeat({
    id,
    kind: body.kind === "native" ? "native" : "webgpu",
    adapter: String(body.adapter || "Unknown adapter"),
    cores: typeof body.cores === "number" ? body.cores : null,
    wallet: body.wallet ? String(body.wallet) : null,
  });
  return NextResponse.json(result);
}
