#!/usr/bin/env node
const raw = process.env.COMPUTEFI_JOB;
if (!raw) throw new Error("COMPUTEFI_JOB was not supplied by the worker");
const job = JSON.parse(raw);
const requested = String(job.modelSource || "").trim();
const fallback = process.env.COMPUTEFI_LEMONADE_MODEL || "Qwen3-Coder-Next-GGUF";
const model = requested.startsWith("lemonade:") ? requested.slice("lemonade:".length).trim() : fallback;
const allowed = (process.env.COMPUTEFI_ALLOWED_LEMONADE_MODELS || fallback).split(",").map((value) => value.trim()).filter(Boolean);
if (!allowed.includes(model)) throw new Error(`Model '${model}' is not allowed on this worker`);
const response = await fetch(`${process.env.COMPUTEFI_LEMONADE_URL || "http://127.0.0.1:13305"}/v1/chat/completions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, stream: false, messages: [{ role: "system", content: "You are a local code-creation worker. Return requested code and concise run instructions. Do not execute commands or claim repository changes." }, { role: "user", content: String(job.prompt || "") }] }), signal: AbortSignal.timeout(Number(process.env.COMPUTEFI_TIMEOUT_MS || 1800000)) });
if (!response.ok) throw new Error(`Lemonade request failed: ${response.status} ${await response.text()}`);
const output = (await response.json())?.choices?.[0]?.message?.content;
if (!output) throw new Error("Lemonade returned no code output");
process.stdout.write(String(output).slice(0, 4000));
