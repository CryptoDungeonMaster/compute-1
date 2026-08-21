import { PublicKey } from "@solana/web3.js";
import { createPublicKey, verify } from "node:crypto";

export const ADMIN_WALLET = process.env.ADMIN_WALLET || "298gTyREYCBykFYSd66Y2Nj18d2TtaWFtF1cTn96dyoW";

type Challenge = { message: string; expiresAt: number };
const challenges = new Map<string, Challenge>();

export function isAdminWallet(wallet: string | null | undefined) {
  return wallet === ADMIN_WALLET;
}

export function createAdminChallenge(wallet: string) {
  if (!isAdminWallet(wallet)) return null;
  const nonce = crypto.randomUUID();
  const message = `ComputeFi admin access\nWallet: ${wallet}\nNonce: ${nonce}`;
  challenges.set(wallet, { message, expiresAt: Date.now() + 5 * 60_000 });
  return message;
}

export function verifyAdminChallenge(wallet: string, message: string, signature: string) {
  if (!isAdminWallet(wallet)) return false;
  const challenge = challenges.get(wallet);
  if (!challenge || challenge.expiresAt < Date.now() || challenge.message !== message) return false;
  try {
    const key = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(new PublicKey(wallet).toBytes())]);
    const valid = verify(null, new TextEncoder().encode(message), createPublicKey({ key, format: "der", type: "spki" }), Buffer.from(signature, "base64"));
    if (valid) challenges.delete(wallet);
    return valid;
  } catch {
    return false;
  }
}
