import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { MongoClient, type Db } from "mongodb";
import type { Earnings, JobDoc, LedgerEntry, WorkerDoc } from "@/lib/types";
import { workerShare } from "@/lib/escrow";

const STALE_MS = 20_000;
const FILE = path.join(process.cwd(), ".data", "mesh.json");
const ADJECTIVES = ["Amber", "Cobalt", "Juniper", "Nova", "Sable", "Solar", "Velvet", "Violet"];
const NOUNS = ["Badger", "Falcon", "Kestrel", "Lynx", "Otter", "Raven", "Sparrow", "Tiger"];
function workerName(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `${ADJECTIVES[hash % ADJECTIVES.length]} ${NOUNS[(hash >>> 5) % NOUNS.length]}-${(hash % 97).toString().padStart(2, "0")}`;
}

type Snapshot = { workers: WorkerDoc[]; jobs: JobDoc[]; ledger: LedgerEntry[] };

const globalStore = globalThis as typeof globalThis & {
  _tapMongo?: Db;
  _tapMongoTried?: boolean;
};

let fileLock: Promise<void> = Promise.resolve();
let mongoAssignLock: Promise<void> = Promise.resolve();

function uri() {
  return process.env.MONGODB_URI || process.env.MONGO_URI || "";
}

async function mongoDb(): Promise<Db | null> {
  if (globalStore._tapMongo) return globalStore._tapMongo;
  if (globalStore._tapMongoTried && !globalStore._tapMongo) return null;
  const connection = uri();
  if (!connection) return null;
  globalStore._tapMongoTried = true;
  try {
    const client = new MongoClient(connection);
    await client.connect();
    globalStore._tapMongo = client.db();
    await globalStore._tapMongo.collection("workers").createIndex({ id: 1 }, { unique: true });
    await globalStore._tapMongo.collection("jobs").createIndex({ createdAt: 1 });
    await globalStore._tapMongo.collection("jobs").createIndex({ paySignature: 1 }, { unique: true });
    await globalStore._tapMongo.collection("ledger").dropIndex("jobId_1_kind_1").catch(() => undefined);
    await globalStore._tapMongo.collection("ledger").createIndex(
      { jobId: 1, kind: 1, wallet: 1 },
      { name: "job_credit_wallet_unique_v2", unique: true, partialFilterExpression: { kind: "credit" } },
    );
    return globalStore._tapMongo;
  } catch (err) {
    console.error("MongoDB connect failed, using file store", err);
    return null;
  }
}

async function readFileStore(): Promise<Snapshot> {
  try {
    const raw = await readFile(FILE, "utf8");
    const data = JSON.parse(raw) as Snapshot;
    return {
      workers: Array.isArray(data.workers) ? data.workers : [],
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      ledger: Array.isArray(data.ledger) ? data.ledger : [],
    };
  } catch {
    return { workers: [], jobs: [], ledger: [] };
  }
}

async function writeFileStore(data: Snapshot) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2));
}

function withFileLock<T>(fn: () => Promise<T>) {
  const run = fileLock.then(fn, fn);
  fileLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function live(workers: WorkerDoc[], now = Date.now()) {
  return workers.filter((w) => now - w.heartbeat < STALE_MS);
}

function assignedIds(job: JobDoc) {
  return job.workerIds?.length ? job.workerIds : job.workerId ? [job.workerId] : [];
}

function completedIds(job: JobDoc) {
  return job.completedWorkerIds || [];
}

function recommendedParallelism(prompt: string, fileData: string | null) {
  const weight = prompt.length + Math.floor((fileData?.length || 0) / 4);
  return weight >= 2_500 ? 3 : weight >= 800 ? 2 : 1;
}

function estimatedDuration(prompt: string) {
  const lengthWeight = Math.min(1, prompt.trim().length / 4_000);
  const jitter = Math.floor(Math.random() * 25_000);
  return Math.min(300_000, Math.round(30_000 + lengthWeight * 245_000 + jitter));
}

function payoutAllocations(workers: WorkerDoc[], lamports: number) {
  const payable = workers.filter((worker): worker is WorkerDoc & { wallet: string } => Boolean(worker.wallet));
  if (!payable.length) return [];
  const total = workerShare(lamports);
  const perWorker = Math.floor(total / payable.length);
  const byWallet = new Map<string, number>();
  payable.forEach((worker, index) => byWallet.set(worker.wallet, (byWallet.get(worker.wallet) || 0) + perWorker + (index === 0 ? total - perWorker * payable.length : 0)));
  return Array.from(byWallet, ([wallet, amount]) => ({ wallet, lamports: amount }));
}

async function reclaimStale(jobs: JobDoc[], workers: WorkerDoc[], now = Date.now()) {
  const liveIds = new Set(live(workers, now).map((w) => w.id));
  return jobs.map((job) => {
    if (job.status === "running") {
      const remaining = assignedIds(job).filter((id) => liveIds.has(id));
      if (remaining.length === assignedIds(job).length) return job;
      return {
        ...job,
        status: remaining.length ? "running" as const : "open" as const,
        workerId: remaining[0] || null,
        workerIds: remaining,
        completedWorkerIds: completedIds(job).filter((id) => remaining.includes(id)),
        workerKind: remaining.length ? job.workerKind : null,
        updatedAt: now,
      };
    }
    return job;
  });
}

function assign(jobs: JobDoc[], workers: WorkerDoc[], now = Date.now()) {
  const idle = shuffle(live(workers, now).filter((w) => w.status === "idle" && Boolean(w.wallet)));
  const nextJobs = jobs.map((j) => ({ ...j }));
  const nextWorkers = workers.map((w) => ({ ...w }));

  for (const job of nextJobs.sort((a, b) => a.createdAt - b.createdAt)) {
    if (job.status !== "open" && job.status !== "running") continue;
    const ids = assignedIds(job);
    while (ids.length < (job.parallelism || 1)) {
      const eligibleIndex = idle.findIndex((worker) => !ids.includes(worker.id) && (job.modelSource.startsWith("managed:") || worker.kind === "native") && (worker.minimumRewardSol ?? 0.01) <= Number(job.budget));
      const worker = eligibleIndex >= 0 ? idle.splice(eligibleIndex, 1)[0] : undefined;
      if (!worker) break;
      ids.push(worker.id);
      job.status = "running";
      job.workerId = ids[0];
      job.workerIds = ids;
      job.completedWorkerIds = completedIds(job);
      job.workerKind = worker.kind;
      job.startedAt ||= now;
      job.readyAt ||= now + (job.estimatedDurationMs || 0);
      job.progress = 5;
      job.updatedAt = now;
      const row = nextWorkers.find((w) => w.id === worker.id);
      if (row) { row.status = "busy"; row.jobId = job.id; }
    }
  }

  return { jobs: nextJobs, workers: live(nextWorkers, now) };
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function listWorkers(): Promise<WorkerDoc[]> {
  const db = await mongoDb();
  const now = Date.now();
  if (db) {
    await assignMongo(db, now);
    const workers = (await db.collection("workers").find({}).toArray()) as unknown as WorkerDoc[];
    return live(workers, now);
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const workers = live(data.workers, now);
    const jobs = await reclaimStale(data.jobs, workers, now);
    await writeFileStore({ workers, jobs, ledger: data.ledger });
    return workers;
  });
}

export async function listJobs(): Promise<JobDoc[]> {
  const db = await mongoDb();
  if (db) {
    return (await db
      .collection("jobs")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()) as unknown as JobDoc[];
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    return [...data.jobs].sort((a, b) => b.createdAt - a.createdAt);
  });
}

export async function getJob(id: string): Promise<JobDoc | null> {
  const db = await mongoDb();
  if (db) return (await db.collection("jobs").findOne({ id })) as unknown as JobDoc | null;
  return withFileLock(async () => (await readFileStore()).jobs.find((job) => job.id === id) ?? null);
}

export async function heartbeat(input: Omit<WorkerDoc, "name" | "status" | "jobId" | "heartbeat"> & { jobId?: string | null }) {
  const now = Date.now();
  const db = await mongoDb();

  if (db) {
    const existing = (await db.collection("workers").findOne({ id: input.id })) as unknown as WorkerDoc | null;
    if (existing?.authToken && existing.authToken !== input.authToken) {
      throw new Error("Worker token does not match this worker id");
    }
    const doc: WorkerDoc = {
      id: input.id,
      kind: input.kind,
      adapter: input.adapter,
      cores: input.cores,
      capacityTflops: input.capacityTflops,
      minimumRewardSol: input.minimumRewardSol,
      wallet: input.wallet,
      name: existing?.name || workerName(input.id),
      authToken: input.authToken,
      status: existing?.status === "busy" && existing.jobId ? "busy" : "idle",
      jobId: existing?.status === "busy" ? existing.jobId : null,
      heartbeat: now,
    };
    await db.collection("workers").updateOne({ id: input.id }, { $set: doc }, { upsert: true });
    await assignMongo(db, now);
    const fresh = (await db.collection("workers").findOne({ id: input.id })) as unknown as WorkerDoc;
    const job = fresh.jobId
      ? ((await db.collection("jobs").findOne({ id: fresh.jobId })) as unknown as JobDoc | null)
      : null;
    return { worker: fresh, job };
  }

  return withFileLock(async () => {
    const data = await readFileStore();
    const existing = data.workers.find((w) => w.id === input.id);
    if (existing?.authToken && existing.authToken !== input.authToken) {
      throw new Error("Worker token does not match this worker id");
    }
    const doc: WorkerDoc = {
      id: input.id,
      kind: input.kind,
      adapter: input.adapter,
      cores: input.cores,
      capacityTflops: input.capacityTflops,
      minimumRewardSol: input.minimumRewardSol,
      wallet: input.wallet,
      name: existing?.name || workerName(input.id),
      authToken: input.authToken,
      status: existing?.status === "busy" && existing.jobId ? "busy" : "idle",
      jobId: existing?.status === "busy" ? existing.jobId : null,
      heartbeat: now,
    };
    const workers = [...data.workers.filter((w) => w.id !== input.id), doc];
    const jobs = await reclaimStale(data.jobs, workers, now);
    const assigned = assign(jobs, workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
    const fresh = assigned.workers.find((w) => w.id === input.id) ?? doc;
    const job = fresh.jobId ? assigned.jobs.find((j) => j.id === fresh.jobId) ?? null : null;
    return { worker: fresh, job };
  });
}

export async function removeWorker(id: string) {
  const db = await mongoDb();
  const now = Date.now();
  if (db) {
    const existing = (await db.collection("workers").findOne({ id })) as unknown as WorkerDoc | null;
    if (existing?.jobId) {
      const job = (await db.collection("jobs").findOne({ id: existing.jobId })) as unknown as JobDoc | null;
      const remaining = job ? assignedIds(job).filter((workerId) => workerId !== id) : [];
      await db.collection("jobs").updateOne(
        { id: existing.jobId, status: "running" },
        { $set: { status: remaining.length ? "running" : "open", workerId: remaining[0] || null, workerIds: remaining, completedWorkerIds: job ? completedIds(job).filter((workerId) => workerId !== id) : [], workerKind: remaining.length ? job?.workerKind || null : null, updatedAt: now } },
      );
    }
    await db.collection("workers").deleteOne({ id });
    await assignMongo(db, now);
    return;
  }
  await withFileLock(async () => {
    const data = await readFileStore();
    const existing = data.workers.find((w) => w.id === id);
    let jobs = data.jobs;
    if (existing?.jobId) {
      jobs = jobs.map((j) =>
        j.id === existing.jobId && j.status === "running"
          ? (() => { const remaining = assignedIds(j).filter((workerId) => workerId !== id); return { ...j, status: remaining.length ? "running" as const : "open" as const, workerId: remaining[0] || null, workerIds: remaining, completedWorkerIds: completedIds(j).filter((workerId) => workerId !== id), workerKind: remaining.length ? j.workerKind : null, updatedAt: now }; })()
          : j,
      );
    }
    const workers = data.workers.filter((w) => w.id !== id);
    const assigned = assign(jobs, workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
  });
}

export async function createJob(input: Omit<JobDoc, "id" | "accessToken" | "status" | "workerId" | "workerIds" | "completedWorkerIds" | "workerKind" | "proof" | "result" | "progress" | "parallelism" | "estimatedDurationMs" | "startedAt" | "readyAt" | "createdAt" | "updatedAt">) {
  const now = Date.now();
  const job: JobDoc = {
    ...input,
    id: crypto.randomUUID(),
    accessToken: crypto.randomUUID(),
    status: "open",
    workerId: null,
    workerIds: [],
    completedWorkerIds: [],
    workerKind: null,
    proof: null,
    result: null,
    progress: 0,
    parallelism: recommendedParallelism(input.prompt, input.fileData),
    estimatedDurationMs: estimatedDuration(input.prompt),
    startedAt: null,
    readyAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const db = await mongoDb();
  if (db) {
    if (await db.collection("jobs").findOne({ paySignature: input.paySignature })) throw new Error("This escrow payment has already funded a task.");
    await db.collection("jobs").insertOne(job);
    await assignMongo(db, now);
    return (await db.collection("jobs").findOne({ id: job.id })) as unknown as JobDoc;
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    if (data.jobs.some((existing) => existing.paySignature === input.paySignature)) throw new Error("This escrow payment has already funded a task.");
    const jobs = [job, ...data.jobs];
    const assigned = assign(jobs, data.workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
    return assigned.jobs.find((j) => j.id === job.id) ?? job;
  });
}

async function assignMongo(db: Db, now: number) {
  const run = mongoAssignLock.then(() => assignMongoUnlocked(db, now));
  mongoAssignLock = run.then(() => undefined, () => undefined);
  return run;
}

async function assignMongoUnlocked(db: Db, now: number) {
  await db.collection("workers").deleteMany({ heartbeat: { $lt: now - STALE_MS } });
  const workers = (await db.collection("workers").find({}).toArray()) as unknown as WorkerDoc[];
  const jobs = (await db.collection("jobs").find({}).toArray()) as unknown as JobDoc[];
  const reclaimed = await reclaimStale(jobs, workers, now);
  for (const job of reclaimed) {
    const before = jobs.find((item) => item.id === job.id);
    if (before && (before.status !== job.status || assignedIds(before).join() !== assignedIds(job).join())) await db.collection("jobs").updateOne({ id: job.id }, { $set: { status: job.status, workerId: job.workerId, workerIds: assignedIds(job), completedWorkerIds: completedIds(job), workerKind: job.workerKind, updatedAt: now } });
  }
  const idle = shuffle(live(workers, now).filter((w) => (w.status === "idle" || !w.jobId) && Boolean(w.wallet)));
  const active = reclaimed.filter((j) => j.status === "open" || j.status === "running").sort((a, b) => a.createdAt - b.createdAt);
  for (const job of active) {
    const ids = assignedIds(job);
    while (ids.length < (job.parallelism || 1)) {
      const eligibleIndex = idle.findIndex((worker) => !ids.includes(worker.id) && (job.modelSource.startsWith("managed:") || worker.kind === "native") && (worker.minimumRewardSol ?? 0.01) <= Number(job.budget));
      const worker = eligibleIndex >= 0 ? idle.splice(eligibleIndex, 1)[0] : undefined;
      if (!worker) break;
      const startedAt = job.startedAt || now;
      const readyAt = job.readyAt || startedAt + (job.estimatedDurationMs || 0);
      const claimedWorker = await db.collection("workers").findOneAndUpdate({ id: worker.id, status: "idle", $or: [{ jobId: null }, { jobId: { $exists: false } }] }, { $set: { status: "busy", jobId: job.id } }, { returnDocument: "after" });
      if (!claimedWorker) continue;
      ids.push(worker.id);
      await db.collection("jobs").updateOne({ id: job.id, status: { $in: ["open", "running"] } }, { $set: { status: "running", workerId: ids[0], workerIds: ids, completedWorkerIds: completedIds(job), workerKind: worker.kind, startedAt, readyAt, progress: 5, updatedAt: now } });
    }
  }
}

export function usingMongo() {
  return Boolean(uri());
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function summarize(entries: LedgerEntry[], wallet: string, jobsCompleted: number): Earnings {
  const mine = entries.filter((e) => e.wallet === wallet);
  const credits = mine.filter((e) => e.kind === "credit");
  const payouts = mine.filter((e) => e.kind === "payout");
  const creditSum = credits.reduce((s, e) => s + e.lamports, 0);
  const payoutSum = payouts.reduce((s, e) => s + e.lamports, 0);
  const today = startOfToday();
  return {
    availableLamports: Math.max(0, creditSum - payoutSum),
    earnedTodayLamports: credits.filter((e) => e.createdAt >= today).reduce((s, e) => s + e.lamports, 0),
    lifetimeLamports: creditSum,
    jobsCompleted,
    entries: mine.sort((a, b) => b.createdAt - a.createdAt),
  };
}

export async function getEarnings(wallet: string): Promise<Earnings> {
  const db = await mongoDb();
  if (db) {
    const entries = (await db.collection("ledger").find({ wallet }).toArray()) as unknown as LedgerEntry[];
    return summarize(entries, wallet, entries.filter((e) => e.kind === "credit").length);
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const jobsCompleted = data.ledger.filter((e) => e.wallet === wallet && e.kind === "credit").length;
    return summarize(data.ledger, wallet, jobsCompleted);
  });
}

export async function listLedger(): Promise<LedgerEntry[]> {
  const db = await mongoDb();
  if (db) return (await db.collection("ledger").find({}).sort({ createdAt: -1 }).limit(500).toArray()) as unknown as LedgerEntry[];
  return withFileLock(async () => (await readFileStore()).ledger.sort((a, b) => b.createdAt - a.createdAt));
}

export async function completeJob(input: { jobId: string; workerId: string; authToken: string; proof: string; result?: { kind: "text" | "image"; content: string } | null }) {
  const now = Date.now();
  const db = await mongoDb();

  if (db) {
    const job = (await db.collection("jobs").findOne({ id: input.jobId })) as unknown as JobDoc | null;
    if (!job) throw new Error("Job not found");
    const worker = (await db.collection("workers").findOne({ id: input.workerId })) as unknown as WorkerDoc | null;
    if (job.status !== "running" || !assignedIds(job).includes(input.workerId) || worker?.authToken !== input.authToken) {
      throw new Error("This worker is not assigned to that job");
    }
    if (job.readyAt && now < job.readyAt) throw new Error(`Processing window has ${Math.ceil((job.readyAt - now) / 1000)} seconds remaining`);
    const completed = Array.from(new Set([...completedIds(job), input.workerId]));
    const participants = assignedIds(job);
    const done = participants.every((id) => completed.includes(id));
    await db.collection("jobs").updateOne({ id: job.id, status: "running" }, { $set: { status: done ? "done" : "running", completedWorkerIds: completed, proof: [job.proof, input.proof].filter(Boolean).join("\n---\n"), result: done && input.result ? input.result : job.result ?? null, progress: done ? 100 : Math.max(10, Math.round((completed.length / participants.length) * 90)), updatedAt: now } });
    await db.collection("workers").updateOne({ id: input.workerId, jobId: job.id }, { $set: { status: "idle", jobId: null } });
    if (done && job.lamports > 0) {
      const participantWorkers = (await db.collection("workers").find({ id: { $in: participants } }).toArray()) as unknown as WorkerDoc[];
      for (const allocation of payoutAllocations(participantWorkers, job.lamports)) await db.collection("ledger").updateOne({ jobId: job.id, kind: "credit", wallet: allocation.wallet }, { $setOnInsert: { id: crypto.randomUUID(), wallet: allocation.wallet, lamports: allocation.lamports, kind: "credit", jobId: job.id, sig: job.paySignature, createdAt: now } }, { upsert: true });
    }
    await assignMongo(db, now);
    return (await db.collection("jobs").findOne({ id: job.id })) as unknown as JobDoc;
  }

  return withFileLock(async () => {
    const data = await readFileStore();
    const job = data.jobs.find((j) => j.id === input.jobId);
    if (!job) throw new Error("Job not found");
    const worker = data.workers.find((w) => w.id === input.workerId);
    if (job.status !== "running" || !assignedIds(job).includes(input.workerId) || worker?.authToken !== input.authToken) throw new Error("This worker is not assigned to that job");
    if (job.readyAt && now < job.readyAt) throw new Error(`Processing window has ${Math.ceil((job.readyAt - now) / 1000)} seconds remaining`);
    const participants = assignedIds(job);
    job.completedWorkerIds = Array.from(new Set([...completedIds(job), input.workerId]));
    const done = participants.every((id) => job.completedWorkerIds.includes(id));
    job.status = done ? "done" : "running"; job.proof = [job.proof, input.proof].filter(Boolean).join("\n---\n"); if (done && input.result) job.result = input.result; job.progress = done ? 100 : Math.max(10, Math.round((job.completedWorkerIds.length / participants.length) * 90)); job.updatedAt = now;
    if (worker) { worker.status = "idle"; worker.jobId = null; }
    if (done && job.lamports > 0) {
      const participantWorkers = data.workers.filter((item) => participants.includes(item.id));
      for (const allocation of payoutAllocations(participantWorkers, job.lamports)) if (!data.ledger.some((entry) => entry.jobId === job.id && entry.kind === "credit" && entry.wallet === allocation.wallet)) data.ledger.push({ id: crypto.randomUUID(), wallet: allocation.wallet, lamports: allocation.lamports, kind: "credit", jobId: job.id, sig: job.paySignature, createdAt: now });
    }
    const assigned = assign(data.jobs, data.workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
    return job;
  });
}

/** Completes hosted code/image work and credits the randomly assigned online worker. */
export async function completeManagedJob(jobId: string, proof: string, result: { kind: "text" | "image"; content: string }) {
  const now = Date.now();
  const db = await mongoDb();
  if (db) {
    const job = (await db.collection("jobs").findOne({ id: jobId })) as unknown as JobDoc | null;
    if (!job) throw new Error("Task not found");
    if (!job.modelSource.startsWith("managed:")) throw new Error("This is not a managed task");
    if (job.status === "done") return job;
    const participants = assignedIds(job);
    if (job.status !== "running" || !participants.length) throw new Error("Task is waiting for an available worker");
    if (job.readyAt && now < job.readyAt) throw new Error(`Processing window has ${Math.ceil((job.readyAt - now) / 1000)} seconds remaining`);
    const workers = (await db.collection("workers").find({ id: { $in: participants } }).toArray()) as unknown as WorkerDoc[];
    if (!workers.some((worker) => worker.wallet)) throw new Error("Assigned workers have no payout wallet");
    const claimed = await db.collection("jobs").findOneAndUpdate(
      { id: job.id, status: "running" },
      { $set: { status: "done", proof, result, completedWorkerIds: participants, progress: 100, updatedAt: now } },
      { returnDocument: "after" },
    );
    if (!claimed) return (await db.collection("jobs").findOne({ id: job.id })) as unknown as JobDoc;
    await db.collection("workers").updateMany({ id: { $in: participants }, jobId: job.id }, { $set: { status: "idle", jobId: null } });
    for (const allocation of payoutAllocations(workers, job.lamports)) await db.collection("ledger").updateOne({ jobId: job.id, kind: "credit", wallet: allocation.wallet }, { $setOnInsert: { id: crypto.randomUUID(), wallet: allocation.wallet, lamports: allocation.lamports, kind: "credit", jobId: job.id, sig: job.paySignature, createdAt: now } }, { upsert: true });
    await assignMongo(db, now);
    return claimed as unknown as JobDoc;
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const job = data.jobs.find((item) => item.id === jobId);
    if (!job) throw new Error("Task not found");
    if (!job.modelSource.startsWith("managed:")) throw new Error("This is not a managed task");
    if (job.status === "done") return job;
    const participants = assignedIds(job);
    if (job.status !== "running" || !participants.length) throw new Error("Task is waiting for an available worker");
    if (job.readyAt && now < job.readyAt) throw new Error(`Processing window has ${Math.ceil((job.readyAt - now) / 1000)} seconds remaining`);
    const workers = data.workers.filter((item) => participants.includes(item.id) && item.wallet);
    if (!workers.length) throw new Error("Assigned workers have no payout wallet");
    job.status = "done"; job.proof = proof; job.result = result; job.completedWorkerIds = participants; job.progress = 100; job.updatedAt = now;
    workers.forEach((worker) => { worker.status = "idle"; worker.jobId = null; });
    for (const allocation of payoutAllocations(workers, job.lamports)) if (!data.ledger.some((entry) => entry.kind === "credit" && entry.jobId === job.id && entry.wallet === allocation.wallet)) data.ledger.push({ id: crypto.randomUUID(), wallet: allocation.wallet, lamports: allocation.lamports, kind: "credit", jobId: job.id, sig: job.paySignature, createdAt: now });
    const assigned = assign(data.jobs, data.workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
    return job;
  });
}

export async function killJob(jobId: string) {
  const now = Date.now();
  const db = await mongoDb();
  if (db) {
    const job = (await db.collection("jobs").findOne({ id: jobId })) as unknown as JobDoc | null;
    if (!job) throw new Error("Task not found");
    if (job.status === "done" || job.status === "killed") throw new Error("Only waiting or running tasks can be killed");
    await db.collection("jobs").updateOne({ id: jobId, status: { $in: ["open", "running"] } }, { $set: { status: "killed", proof: "Killed by administrator", progress: 0, updatedAt: now } });
    if (assignedIds(job).length) await db.collection("workers").updateMany({ id: { $in: assignedIds(job) }, jobId }, { $set: { status: "idle", jobId: null } });
    await assignMongo(db, now);
    return (await db.collection("jobs").findOne({ id: jobId })) as unknown as JobDoc;
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const job = data.jobs.find((item) => item.id === jobId);
    if (!job) throw new Error("Task not found");
    if (job.status === "done" || job.status === "killed") throw new Error("Only waiting or running tasks can be killed");
    job.status = "killed"; job.proof = "Killed by administrator"; job.progress = 0; job.updatedAt = now;
    data.workers.filter((worker) => assignedIds(job).includes(worker.id)).forEach((worker) => { worker.status = "idle"; worker.jobId = null; });
    const assigned = assign(data.jobs, data.workers, now);
    await writeFileStore({ ...assigned, ledger: data.ledger });
    return job;
  });
}

export async function expediteJob(jobId: string) {
  const now = Date.now();
  const db = await mongoDb();
  if (db) {
    const result = await db.collection("jobs").findOneAndUpdate({ id: jobId, status: "running" }, { $set: { readyAt: now, updatedAt: now } }, { returnDocument: "after" });
    if (!result) throw new Error("Only running tasks can be sped up");
    return result as unknown as JobDoc;
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const job = data.jobs.find((item) => item.id === jobId);
    if (!job || job.status !== "running") throw new Error("Only running tasks can be sped up");
    job.readyAt = now; job.updatedAt = now;
    await writeFileStore(data);
    return job;
  });
}

export async function recordPayout(entry: LedgerEntry) {
  const db = await mongoDb();
  if (db) {
    await db.collection("ledger").insertOne(entry);
    return;
  }
  await withFileLock(async () => {
    const data = await readFileStore();
    data.ledger.push(entry);
    await writeFileStore(data);
  });
}
