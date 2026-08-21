import { NextResponse } from "next/server";
import { getJob } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = new URL(req.url).searchParams.get("accessToken") || "";
  const job = await getJob(params.id);
  if (!job || !token || token !== job.accessToken) return NextResponse.json({ error: "This result is not available for this session." }, { status: 403 });
  if (job.status !== "done") return NextResponse.json({ error: "This task is not complete yet." }, { status: 409 });
  if (!job.result) return NextResponse.json({ error: "The worker completed this task without a displayable result." }, { status: 404 });
  return NextResponse.json({ result: job.result, completedAt: job.updatedAt });
}
