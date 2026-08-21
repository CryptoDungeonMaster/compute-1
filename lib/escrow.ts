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
import bs58 from "bs58";

const FILE = path.join(process.cwd(), ".data", "escrow.json");
const FEE_BPS = 250;
export const MIN_JOB_LAMPORTS = Math.round(0.01 * LAMPORTS_PER_SOL);

const globalEscrow = globalThis as typeof globalThis & { _tapEscrow?: Keypair };

export function rpcUrl() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("mainnet-beta");
}

export function connection() {
  return new Connection(rpcUrl(), "confirmed");
}

function keypairFromSecret(value: string) {
  const secret = value.trim().replace(/^['"]|['"]$/g, "");
  let bytes: Uint8Array;
  try {
    const parsed = JSON.parse(secret) as unknown;
    if (typeof parsed === "string") return keypairFromSecret(parsed);
    if (!Array.isArray(parsed) || !parsed.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) throw new Error("not a byte array");
    bytes = Uint8Array.from(parsed as number[]);
  } catch {
    try { bytes = bs58.decode(secret); } catch { throw new Error("ESCROW_SECRET_KEY must be a JSON byte array or a base58 Solana secret key"); }
  }
  if (bytes.length === 32) return Keypair.fromSeed(bytes);
  if (bytes.length === 64) return Keypair.fromSecretKey(bytes);
  throw new Error("ESCROW_SECRET_KEY must decode to 32 (seed) or 64 (secret-key) bytes");
}

export async function getEscrowKeypair() {
  if (globalEscrow._tapEscrow) return globalEscrow._tapEscrow;
  if (process.env.ESCROW_SECRET_KEY) {
    globalEscrow._tapEscrow = keypairFromSecret(process.env.ESCROW_SECRET_KEY);
    return globalEscrow._tapEscrow;
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") throw new Error("ESCROW_SECRET_KEY is missing from the server environment");
  try {
    globalEscrow._tapEscrow = keypairFromSecret(await readFile(FILE, "utf8"));
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
  const balance = await conn.getBalance(kp.publicKey, "confirmed");
  const feeReserve = 10_000;
  if (balance < lamports + feeReserve) throw new Error(`Escrow has ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL but needs ${((lamports + feeReserve) / LAMPORTS_PER_SOL).toFixed(4)} SOL including network fees.`);
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

export async function getEscrowBalance() {
  const kp = await getEscrowKeypair();
  return connection().getBalance(kp.publicKey, "confirmed");
}

export const PROTOCOL_FEE_BPS = FEE_BPS;
