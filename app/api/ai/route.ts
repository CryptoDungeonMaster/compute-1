import { NextResponse } from "next/server";
import { allowAiRequest, generateCode, generateImage } from "@/lib/openrouter";
import { MIN_JOB_LAMPORTS } from "@/lib/escrow";
import { completeManagedJob, getJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "image" ? "image" : body.kind === "code" ? "code" : null;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!kind || !prompt || !jobId) return NextResponse.json({ error: "Fund an AI job before processing." }, { status: 400 });
  if (prompt.length > 12_000) return NextResponse.json({ error: "Keep prompts under 12,000 characters." }, { status: 400 });
  try {
    const job = await getJob(jobId);
    if (!job || job.lamports < MIN_JOB_LAMPORTS || !job.paySignature) return NextResponse.json({ error: "A verified 0.01 SOL escrow payment is required." }, { status: 402 });
    if (!accessToken || accessToken !== job.accessToken) return NextResponse.json({ error: "This funded task belongs to another session." }, { status: 403 });
    if (job.prompt !== prompt || job.modelSource !== `managed:${kind}`) return NextResponse.json({ error: "Task details do not match the funded request." }, { status: 400 });
    if (job.status === "open") return NextResponse.json({ error: "Waiting for an online GPU worker.", waiting: true }, { status: 409 });
    if (job.status === "killed") return NextResponse.json({ error: "This task was stopped by an administrator." }, { status: 410 });
    if (job.status === "done") return NextResponse.json({ error: "This task has already settled." }, { status: 409 });
    if (!allowAiRequest(ip)) return NextResponse.json({ error: "AI request limit reached. Try again in a few minutes." }, { status: 429 });
    if (kind === "code") {
      const result = await generateCode(prompt);
      await completeManagedJob(job.id, `Managed code generation completed (${result.length} characters)`);
      return NextResponse.json({ result, settled: true });
    }
    const result = await generateImage(prompt);
    await completeManagedJob(job.id, "Managed image generation completed");
    return NextResponse.json({ ...result, settled: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI request failed." }, { status: 500 });
  }
}
