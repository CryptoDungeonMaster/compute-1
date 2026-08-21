import { NextResponse } from "next/server";
import { createAdminChallenge } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { wallet } = await req.json().catch(() => ({}));
  const message = createAdminChallenge(typeof wallet === "string" ? wallet : "");
  if (!message) return NextResponse.json({ error: "This wallet is not an administrator." }, { status: 403 });
  return NextResponse.json({ message });
}
