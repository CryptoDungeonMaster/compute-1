import { NextResponse } from "next/server";
import { completeJob } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const jobId = String(body.jobId || "");
  const workerId = String(body.workerId || "");
  const authToken = String(body.authToken || "");
  const proof = String(body.proof || "");
  if (!jobId || !workerId || !authToken || !proof) return NextResponse.json({ error: "jobId, workerId, token, and proof are required" }, { status: 400 });
  try {
    const result = body.result && (body.result.kind === "text" || body.result.kind === "image") && typeof body.result.content === "string" && body.result.content.length <= 8_000_000
      ? { kind: body.result.kind, content: body.result.content } as const
      : null;
    return NextResponse.json({ job: await completeJob({ jobId, workerId, authToken, proof, result }) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not complete job" }, { status: 400 });
  }
}
