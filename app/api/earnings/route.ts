import { NextResponse } from "next/server";
import { getEarnings, recordPayout } from "@/lib/store";
import { payFromEscrow } from "@/lib/escrow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "Wallet is required" }, { status: 400 });
  return NextResponse.json({ earnings: await getEarnings(wallet) });
}

export async function POST(req: Request) {
  const { wallet } = await req.json().catch(() => ({}));
  if (!wallet || typeof wallet !== "string") return NextResponse.json({ error: "Wallet is required" }, { status: 400 });
  const earnings = await getEarnings(wallet);
  if (!earnings.availableLamports) return NextResponse.json({ error: "Nothing to claim yet." }, { status: 400 });
  try {
    const sig = await payFromEscrow(wallet, earnings.availableLamports);
    await recordPayout({ id: crypto.randomUUID(), wallet, lamports: earnings.availableLamports, kind: "payout", jobId: null, sig, createdAt: Date.now() });
    return NextResponse.json({ signature: sig });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown settlement error";
    const safe = detail.includes("ESCROW_SECRET_KEY") || detail.startsWith("Escrow has") ? detail : `Solana payout failed: ${detail}`;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
