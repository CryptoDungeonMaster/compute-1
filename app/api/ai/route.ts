import { NextResponse } from "next/server";
import { allowAiRequest, generateCode, generateImage } from "@/lib/openrouter";
import { MIN_JOB_LAMPORTS } from "@/lib/escrow";
import { getJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "image" ? "image" : body.kind === "code" ? "code" : null;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!kind || !prompt || !jobId) return NextResponse.json({ error: "Fund an AI job before processing." }, { status: 400 });
  if (prompt.length > 12_000) return NextResponse.json({ error: "Keep prompts under 12,000 characters." }, { status: 400 });
  if (!allowAiRequest(ip)) return NextResponse.json({ error: "AI request limit reached. Try again in a few minutes." }, { status: 429 });
  try {
    const job = await getJob(jobId);
    if (!job || job.lamports < MIN_JOB_LAMPORTS || !job.paySignature) return NextResponse.json({ error: "A verified 0.01 SOL escrow payment is required." }, { status: 402 });
    if (kind === "code") return NextResponse.json({ result: await generateCode(prompt) });
    return NextResponse.json(await generateImage(prompt));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 500 });
  }
}
