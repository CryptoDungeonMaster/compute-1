import { NextResponse } from "next/server";
import { createJob, listJobs, usingMongo } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const jobs = await listJobs();
  return NextResponse.json({ jobs, mongo: usingMongo() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Job text is required" }, { status: 400 });
  }
  const job = await createJob({
    prompt,
    modelSource: String(body.modelSource || "").trim(),
    budget: String(body.budget || "").trim(),
    currency: body.currency === "TP" ? "TP" : "SOL",
    wallet: body.wallet ? String(body.wallet) : null,
  });
  return NextResponse.json({ job });
}
