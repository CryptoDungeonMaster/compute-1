import { NextResponse } from "next/server";
import { createJob, listJobs, usingMongo } from "@/lib/store";
import { solToLamports, verifyPayToEscrow } from "@/lib/escrow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const jobs = await listJobs();
  const visible = jobs.map((job) =>
    Object.fromEntries(Object.entries(job).filter(([key]) => !["wallet", "paySignature", "fileData", "proof"].includes(key))),
  );
  return NextResponse.json({ jobs: visible, mongo: usingMongo() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Job text is required" }, { status: 400 });
  }
  const budget = String(body.budget || "").trim();
  const lamports = solToLamports(budget);
  const paySignature = String(body.paySignature || "").trim();
  if (!lamports || !paySignature) {
    return NextResponse.json({ error: "Pay the SOL budget before posting this job." }, { status: 400 });
  }
  const payment = await verifyPayToEscrow(paySignature, lamports);
  if (!payment.ok) return NextResponse.json({ error: payment.reason }, { status: 400 });
  const fileData = typeof body.fileData === "string" ? body.fileData : null;
  if (fileData && fileData.length > 1_400_000) {
    return NextResponse.json({ error: "Uploads must be 1 MB or smaller." }, { status: 400 });
  }
  const job = await createJob({
    prompt,
    modelSource: String(body.modelSource || "").trim(),
    fileName: String(body.fileName || "").trim(),
    fileData,
    budget,
    currency: "SOL",
    lamports,
    paySignature,
    wallet: body.wallet ? String(body.wallet) : null,
  });
  return NextResponse.json({ job });
}
