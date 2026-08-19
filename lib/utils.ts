import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompact(value: number, digits = 1) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function shortenAddress(address: string, chars = 4) {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function timeAgo(ts: number, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
