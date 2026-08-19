#!/usr/bin/env node
/**
 * Safe starter executor for a Tap Power native worker.
 * Requires Ollama: https://ollama.com
 *
 * It only runs models listed in TAP_POWER_ALLOWED_MODELS. A job may request
 * `ollama:model-name`; otherwise TAP_POWER_OLLAMA_MODEL is used.
 */
import { spawnSync } from "node:child_process";

const raw = process.env.TAP_POWER_JOB;
if (!raw) throw new Error("TAP_POWER_JOB was not supplied by the worker");
const job = JSON.parse(raw);
const fallback = (process.env.TAP_POWER_OLLAMA_MODEL || "").trim();
const requested = String(job.modelSource || "").trim();
const model = requested.startsWith("ollama:") ? requested.slice("ollama:".length).trim() : fallback;
const allowed = (process.env.TAP_POWER_ALLOWED_MODELS || fallback).split(",").map((value) => value.trim()).filter(Boolean);

if (!model) throw new Error("Set TAP_POWER_OLLAMA_MODEL or request an ollama:model-name source");
if (!allowed.includes(model)) throw new Error(`Model '${model}' is not in TAP_POWER_ALLOWED_MODELS`);

let input = String(job.prompt || "").trim();
if (job.fileData?.startsWith("data:text/")) {
  const comma = job.fileData.indexOf(",");
  if (comma >= 0) input += `\n\nAttached input (${job.fileName || "text file"}):\n${Buffer.from(job.fileData.slice(comma + 1), "base64").toString("utf8")}`;
}
if (!input) throw new Error("The assigned job has no prompt");

const result = spawnSync("ollama", ["run", model, input], {
  encoding: "utf8",
  timeout: Number(process.env.TAP_POWER_TIMEOUT_MS || 1800000),
  maxBuffer: 1024 * 1024,
});
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr || `Ollama exited with code ${result.status}`);
process.stdout.write((result.stdout || "Ollama completed without text output").slice(0, 4000));
