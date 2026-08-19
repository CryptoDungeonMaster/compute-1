import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const FILE = path.join(process.cwd(), ".data", "escrow.json");
const FEE_BPS = 250;

const globalEscrow = globalThis as typeof globalThis & { _tapEscrow?: Keypair };

export function rpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("mainnet-beta");
}

export function connection() {
  return new Connection(rpcUrl(), "confirmed");
}

export async function getEscrowKeypair() {
  if (globalEscrow._tapEscrow) return globalEscrow._tapEscrow;
  if (process.env.ESCROW_SECRET_KEY) {
    const raw = JSON.parse(process.env.ESCROW_SECRET_KEY) as number[];
    globalEscrow._tapEscrow = Keypair.fromSecretKey(Uint8Array.from(raw));
    return globalEscrow._tapEscrow;
  }
  try {
    const raw = JSON.parse(await readFile(FILE, "utf8")) as number[];
    globalEscrow._tapEscrow = Keypair.fromSecretKey(Uint8Array.from(raw));
    return globalEscrow._tapEscrow;
  } catch {
    const kp = Keypair.generate();
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(Array.from(kp.secretKey)));
    globalEscrow._tapEscrow = kp;
    return kp;
  }
}

export async function getEscrowPublicKey() {
  const kp = await getEscrowKeypair();
  return kp.publicKey;
}

export function solToLamports(sol: string | number) {
  const n = typeof sol === "number" ? sol : Number(sol);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * LAMPORTS_PER_SOL);
}

export function lamportsToSol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL;
}

export function workerShare(lamports: number) {
  return Math.floor((lamports * (10000 - FEE_BPS)) / 10000);
}

export async function verifyPayToEscrow(signature: string, minLamports: number) {
  const escrow = await getEscrowPublicKey();
  const conn = connection();
  const tx = await conn.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  if (!tx) return { ok: false, reason: "Payment transaction not found yet" };

  let received = 0;
  for (const ix of tx.transaction.message.instructions) {
    if ("parsed" in ix && ix.parsed?.type === "transfer") {
      const info = ix.parsed.info as { destination?: string; lamports?: number };
      if (info.destination === escrow.toBase58()) {
        received += Number(info.lamports || 0);
      }
    }
  }
  if (received < minLamports) {
    return { ok: false, reason: "Escrow did not receive the full SOL amount" };
  }
  return { ok: true, received };
}

export async function payFromEscrow(to: string, lamports: number) {
  const kp = await getEscrowKeypair();
  const conn = connection();
  const dest = new PublicKey(to);
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: kp.publicKey,
      toPubkey: dest,
      lamports,
    }),
  );
  const sig = await sendAndConfirmTransaction(conn, tx, [kp]);
  return sig;
}

export const PROTOCOL_FEE_BPS = FEE_BPS;
