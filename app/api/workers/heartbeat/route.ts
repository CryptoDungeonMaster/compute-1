import { NextResponse } from "next/server";
import { heartbeat } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  const authToken = String(body.authToken || "").trim();
  if (!id || !authToken) {
    return NextResponse.json({ error: "Worker id and token are required" }, { status: 400 });
  }
  try {
    const result = await heartbeat({
      id,
      kind: body.kind === "native" ? "native" : "webgpu",
      adapter: String(body.adapter || "Unknown adapter"),
      cores: typeof body.cores === "number" ? body.cores : null,
      wallet: body.wallet ? String(body.wallet) : null,
      authToken,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Worker heartbeat failed" }, { status: 403 });
  }
}
