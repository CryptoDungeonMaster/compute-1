import { PublicKey } from "@solana/web3.js";
import { createHmac, createPublicKey, timingSafeEqual, verify } from "node:crypto";

export const ADMIN_WALLET = process.env.ADMIN_WALLET || "298gTyREYCBykFYSd66Y2Nj18d2TtaWFtF1cTn96dyoW";

export function isAdminWallet(wallet: string | null | undefined) {
  return wallet === ADMIN_WALLET;
}

export function createAdminChallenge(wallet: string) {
  if (!isAdminWallet(wallet)) return null;
  const nonce = crypto.randomUUID();
  const expiresAt = Date.now() + 5 * 60_000;
  const message = `ComputeFi admin access\nWallet: ${wallet}\nNonce: ${nonce}`;
  const payload = Buffer.from(JSON.stringify({ wallet, message, expiresAt })).toString("base64url");
  return { message, token: `${payload}.${sign(payload)}` };
}

export function verifyAdminChallenge(wallet: string, message: string, signature: string, token: string) {
  if (!isAdminWallet(wallet)) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return false;
  try {
    const challenge = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { wallet: string; message: string; expiresAt: number };
    if (challenge.wallet !== wallet || challenge.message !== message || challenge.expiresAt < Date.now()) return false;
    const key = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(new PublicKey(wallet).toBytes())]);
    const valid = verify(null, new TextEncoder().encode(message), createPublicKey({ key, format: "der", type: "spki" }), Buffer.from(signature, "base64"));
    return valid;
  } catch {
    return false;
  }
}

function sign(value: string) {
  const secret = process.env.ADMIN_AUTH_SECRET || process.env.ESCROW_SECRET_KEY || "development-only-computefi-admin-secret";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
