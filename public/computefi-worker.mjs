#!/usr/bin/env node
/**
 * ComputeFi native GPU worker
 *
 * Uses your machine GPU (NVIDIA via nvidia-smi, else CPU name) and
 * registers as a worker on the ComputeFi mesh. Open jobs are assigned
 * to idle workers automatically.
 *
 *   node computefi-worker.mjs
 *
 * Optional env:
 *   COMPUTEFI_URL     site origin, default http://localhost:3000
 *   COMPUTEFI_WALLET  Solana address to credit
 *   COMPUTEFI_EXECUTOR path to a local executable that receives the job in COMPUTEFI_JOB
 */

import { execSync, spawnSync } from "node:child_process";
import os from "node:os";
import { randomUUID } from "node:crypto";

const BASE = (process.env.COMPUTEFI_URL || "http://localhost:3000").replace(/\/$/, "");
const WALLET = process.env.COMPUTEFI_WALLET || null;
const ID = process.env.COMPUTEFI_WORKER_ID || `native-${randomUUID()}`;
const AUTH_TOKEN = process.env.COMPUTEFI_WORKER_TOKEN || randomUUID();
const EXECUTOR = process.env.COMPUTEFI_EXECUTOR || null;
const CAPACITY_TFLOPS = Math.max(0, Number(process.env.COMPUTEFI_TFLOPS || os.cpus().length * 0.25));
const MIN_REWARD_SOL = Math.max(0.01, Number(process.env.COMPUTEFI_MIN_REWARD_SOL || 0.01));

function gpuName() {
  try {
    const out = execSync("nvidia-smi --query-gpu=name --format=csv,noheader", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
      .split(/\r?\n/)[0];
    if (out) return out;
  } catch {
    /* no NVIDIA tool */
  }
  const cpu = os.cpus()[0]?.model || "CPU";
  return cpu;
}

const adapter = gpuName();
console.log(`ComputeFi native worker`);
console.log(`  id      ${ID}`);
console.log(`  adapter ${adapter}`);
console.log(`  mesh    ${BASE}`);
console.log(`  runner  ${EXECUTOR || "not configured"}`);
console.log(`  capacity ${CAPACITY_TFLOPS.toFixed(2)} reported TFLOPS`);
console.log(`  minimum ${MIN_REWARD_SOL.toFixed(4)} SOL per task`);
console.log(`Keep this process running. Ctrl+C to leave.`);

async function beat() {
  const res = await fetch(`${BASE}/api/workers/heartbeat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: ID,
      kind: "native",
      adapter,
      cores: os.cpus().length,
      capacityTflops: CAPACITY_TFLOPS,
      minimumRewardSol: MIN_REWARD_SOL,
      wallet: WALLET,
      authToken: AUTH_TOKEN,
    }),
  });
  if (!res.ok) {
    throw new Error(`heartbeat ${res.status}`);
  }
  return res.json();
}

async function leave() {
  try {
    await fetch(`${BASE}/api/workers/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ID }),
    });
  } catch {
    /* ignore */
  }
}

async function runJob(initialJob) {
  let job = initialJob;
  if (!EXECUTOR) {
    console.log("  Waiting: set COMPUTEFI_EXECUTOR before this worker can run and settle jobs.");
    return;
  }
  while (job.readyAt && Date.now() < job.readyAt) {
    const seconds = Math.max(1, Math.ceil((job.readyAt - Date.now()) / 1000));
    process.stdout.write(`\rprocessing window ${seconds}s remaining   `);
    await new Promise((resolve) => setTimeout(resolve, Math.min(3000, job.readyAt - Date.now())));
    const heartbeat = await beat();
    if (heartbeat.job) job = heartbeat.job;
  }
  const isNodeScript = EXECUTOR.endsWith(".mjs") || EXECUTOR.endsWith(".js");
  const result = spawnSync(isNodeScript ? process.execPath : EXECUTOR, isNodeScript ? [EXECUTOR] : [], {
    env: { ...process.env, COMPUTEFI_JOB: JSON.stringify(job) },
    encoding: "utf8",
    timeout: Number(process.env.COMPUTEFI_TIMEOUT_MS || 1800000),
  });
  if (result.error || result.status !== 0) {
    console.error(`  Runner failed: ${result.error?.message || result.stderr || `exit ${result.status}`}`);
    return;
  }
  const proof = (result.stdout || "completed by local executor").trim().slice(0, 4000);
  const response = await fetch(`${BASE}/api/jobs/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: job.id, workerId: ID, authToken: AUTH_TOKEN, proof: proof || "completed by local executor", result: { kind: "text", content: proof || "completed by local executor" } }),
  });
  if (!response.ok) throw new Error(`completion ${response.status}`);
  console.log("  Complete. Settlement is available to claim.");
}

let lastJob = null;

async function loop() {
  try {
    const { worker, job } = await beat();
    if (job && job.id !== lastJob) {
      lastJob = job.id;
      console.log(`Assigned job ${job.id}`);
      console.log(`  ${job.prompt}`);
      if (job.modelSource) console.log(`  source ${job.modelSource}`);
      await runJob(job);
    }
    if (!job && lastJob) {
      console.log("Idle. Waiting for the next open job.");
      lastJob = null;
    }
    process.stdout.write(`\r${worker.status.padEnd(8)} workers mesh ok   `);
  } catch (err) {
    console.error(`\n${err.message || err}`);
  }
}

process.on("SIGINT", async () => {
  console.log("\nLeaving the mesh.");
  await leave();
  process.exit(0);
});

await loop();
setInterval(loop, 3000);
