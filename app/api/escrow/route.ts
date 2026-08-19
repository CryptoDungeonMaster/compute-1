import { NextResponse } from "next/server";
import { getEscrowPublicKey } from "@/lib/escrow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ address: (await getEscrowPublicKey()).toBase58() });
  } catch {
    return NextResponse.json({ error: "Escrow is not configured." }, { status: 503 });
  }
}
