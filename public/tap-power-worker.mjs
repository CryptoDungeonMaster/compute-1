#!/usr/bin/env node
/**
 * Tap Power native GPU worker
 *
 * Uses your machine GPU (NVIDIA via nvidia-smi, else CPU name) and
 * registers as a worker on the Tap Power mesh. Open jobs are assigned
 * to idle workers automatically.
 *
 *   node tap-power-worker.mjs
 *
 * Optional env:
 *   TAP_POWER_URL     site origin, default http://localhost:3000
 *   TAP_POWER_WALLET  Solana address to credit
 *   TAP_POWER_EXECUTOR path to a local executable that receives the job in TAP_POWER_JOB
 */

import { execSync, spawnSync } from "node:child_process";
import os from "node:os";
import { randomUUID } from "node:crypto";

const BASE = (process.env.TAP_POWER_URL || "http://localhost:3000").replace(/\/$/, "");
const WALLET = process.env.TAP_POWER_WALLET || null;
const ID = process.env.TAP_POWER_WORKER_ID || `native-${randomUUID()}`;
const AUTH_TOKEN = process.env.TAP_POWER_WORKER_TOKEN || randomUUID();
const EXECUTOR = process.env.TAP_POWER_EXECUTOR || null;

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
console.log(`Tap Power native worker`);
console.log(`  id      ${ID}`);
console.log(`  adapter ${adapter}`);
console.log(`  mesh    ${BASE}`);
console.log(`  runner  ${EXECUTOR || "not configured"}`);
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

async function runJob(job) {
  if (!EXECUTOR) {
    console.log("  Waiting: set TAP_POWER_EXECUTOR before this worker can run and settle jobs.");
    return;
  }
  const isNodeScript = EXECUTOR.endsWith(".mjs") || EXECUTOR.endsWith(".js");
  const result = spawnSync(isNodeScript ? process.execPath : EXECUTOR, isNodeScript ? [EXECUTOR] : [], {
    env: { ...process.env, TAP_POWER_JOB: JSON.stringify(job) },
    encoding: "utf8",
    timeout: Number(process.env.TAP_POWER_TIMEOUT_MS || 1800000),
  });
  if (result.error || result.status !== 0) {
    console.error(`  Runner failed: ${result.error?.message || result.stderr || `exit ${result.status}`}`);
    return;
  }
  const proof = (result.stdout || "completed by local executor").trim().slice(0, 4000);
  const response = await fetch(`${BASE}/api/jobs/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: job.id, workerId: ID, authToken: AUTH_TOKEN, proof: proof || "completed by local executor" }),
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
