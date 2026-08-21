#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const raw = process.env.COMPUTEFI_JOB;
const workflowFile = process.env.COMPUTEFI_COMFY_WORKFLOW;
if (!raw) throw new Error("COMPUTEFI_JOB was not supplied by the worker");
if (!workflowFile) throw new Error("Set COMPUTEFI_COMFY_WORKFLOW to an exported ComfyUI API workflow JSON file");
const job = JSON.parse(raw);
const prompt = String(job.prompt || "").trim();
if (!prompt) throw new Error("The image job has no prompt");
const negative = process.env.COMPUTEFI_COMFY_NEGATIVE_PROMPT || "blurry, low quality, watermark, text";
const seed = String(Math.floor(Math.random() * 2147483647));
const fill = (value) => {
  if (typeof value === "string") return value.replaceAll("{{PROMPT}}", prompt).replaceAll("{{NEGATIVE_PROMPT}}", negative).replaceAll("{{SEED}}", seed);
  if (Array.isArray(value)) return value.map(fill);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, fill(child)]));
  return value;
};
const workflow = fill(JSON.parse(await readFile(workflowFile, "utf8")));
const base = (process.env.COMPUTEFI_COMFY_URL || "http://127.0.0.1:8188").replace(/\/$/, "");
const clientId = randomUUID();
const queued = await fetch(`${base}/prompt`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: workflow, client_id: clientId }), signal: AbortSignal.timeout(30000) });
if (!queued.ok) throw new Error(`ComfyUI queue failed: ${queued.status} ${await queued.text()}`);
const { prompt_id: promptId } = await queued.json();
const until = Date.now() + Number(process.env.COMPUTEFI_TIMEOUT_MS || 1800000);
while (Date.now() < until) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const history = await fetch(`${base}/history/${promptId}`, { signal: AbortSignal.timeout(15000) });
  if (!history.ok) continue;
  const item = (await history.json())[promptId];
  if (!item) continue;
  if (item.status?.status_str === "error") throw new Error(`ComfyUI workflow failed: ${JSON.stringify(item.status.messages || [])}`);
  const images = Object.values(item.outputs || {}).flatMap((output) => output.images || []).map((image) => `${image.type || "output"}/${image.subfolder ? `${image.subfolder}/` : ""}${image.filename}`);
  if (images.length) { process.stdout.write(`ComfyUI completed ${promptId}. Images: ${images.join(", ")}`); process.exit(0); }
}
throw new Error("ComfyUI job timed out");
