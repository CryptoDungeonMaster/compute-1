import { NextResponse } from "next/server";
import { verifyAdminChallenge } from "@/lib/admin";
import { expediteJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { wallet, message, signature, token, jobId } = await req.json().catch(() => ({}));
  if (typeof wallet !== "string" || typeof message !== "string" || typeof signature !== "string" || typeof token !== "string" || !verifyAdminChallenge(wallet, message, signature, token)) return NextResponse.json({ error: "Administrator signature required." }, { status: 403 });
  if (typeof jobId !== "string" || !jobId) return NextResponse.json({ error: "Task id is required." }, { status: 400 });
  try { return NextResponse.json({ job: await expediteJob(jobId) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Task could not be sped up." }, { status: 409 }); }
}
