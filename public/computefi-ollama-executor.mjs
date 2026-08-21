#!/usr/bin/env node
/**
 * Safe starter executor for a ComputeFi native worker.
 * Requires Ollama: https://ollama.com
 *
 * It only runs models listed in COMPUTEFI_ALLOWED_MODELS. A job may request
 * `ollama:model-name`; otherwise COMPUTEFI_OLLAMA_MODEL is used.
 */
import { spawnSync } from "node:child_process";

const raw = process.env.COMPUTEFI_JOB;
if (!raw) throw new Error("COMPUTEFI_JOB was not supplied by the worker");
const job = JSON.parse(raw);
const fallback = (process.env.COMPUTEFI_OLLAMA_MODEL || "").trim();
const requested = String(job.modelSource || "").trim();
const model = requested.startsWith("ollama:") ? requested.slice("ollama:".length).trim() : fallback;
const allowed = (process.env.COMPUTEFI_ALLOWED_MODELS || fallback).split(",").map((value) => value.trim()).filter(Boolean);

if (!model) throw new Error("Set COMPUTEFI_OLLAMA_MODEL or request an ollama:model-name source");
if (!allowed.includes(model)) throw new Error(`Model '${model}' is not in COMPUTEFI_ALLOWED_MODELS`);

let input = String(job.prompt || "").trim();
if (job.fileData?.startsWith("data:text/")) {
  const comma = job.fileData.indexOf(",");
  if (comma >= 0) input += `\n\nAttached input (${job.fileName || "text file"}):\n${Buffer.from(job.fileData.slice(comma + 1), "base64").toString("utf8")}`;
}
if (!input) throw new Error("The assigned job has no prompt");

const result = spawnSync("ollama", ["run", model, input], {
  encoding: "utf8",
  timeout: Number(process.env.COMPUTEFI_TIMEOUT_MS || 1800000),
  maxBuffer: 1024 * 1024,
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr || `Ollama exited with code ${result.status}`);
process.stdout.write((result.stdout || "Ollama completed without text output").slice(0, 4000));
