import { NextResponse } from "next/server";
import { getEscrowPublicKey } from "@/lib/escrow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ address: (await getEscrowPublicKey()).toBase58() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown configuration error";
    return NextResponse.json({ error: "Escrow is not configured.", detail }, { status: 503 });
  }
}
