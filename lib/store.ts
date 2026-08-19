import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { MongoClient, type Db } from "mongodb";
import type { JobDoc, WorkerDoc } from "@/lib/types";

const STALE_MS = 20_000;
const FILE = path.join(process.cwd(), ".data", "mesh.json");

type Snapshot = { workers: WorkerDoc[]; jobs: JobDoc[] };

const globalStore = globalThis as typeof globalThis & {
  _tapMongo?: Db;
  _tapMongoTried?: boolean;
};

let fileLock: Promise<void> = Promise.resolve();

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
    };
  } catch {
    return { workers: [], jobs: [] };
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

async function reclaimStale(jobs: JobDoc[], workers: WorkerDoc[], now = Date.now()) {
  const liveIds = new Set(live(workers, now).map((w) => w.id));
  return jobs.map((job) => {
    if (job.status === "running" && job.workerId && !liveIds.has(job.workerId)) {
      return {
        ...job,
        status: "open" as const,
        workerId: null,
        workerKind: null,
        updatedAt: now,
      };
    }
    return job;
  });
}

function assign(jobs: JobDoc[], workers: WorkerDoc[], now = Date.now()) {
  const idle = live(workers, now).filter((w) => w.status === "idle");
  const nextJobs = jobs.map((j) => ({ ...j }));
  const nextWorkers = workers.map((w) => ({ ...w }));

  for (const job of nextJobs) {
    if (job.status !== "open") continue;
    const worker = idle.shift();
    if (!worker) break;
    job.status = "running";
    job.workerId = worker.id;
    job.workerKind = worker.kind;
    job.updatedAt = now;
    const row = nextWorkers.find((w) => w.id === worker.id);
    if (row) {
      row.status = "busy";
      row.jobId = job.id;
    }
  }

  return { jobs: nextJobs, workers: live(nextWorkers, now) };
}

export async function listWorkers(): Promise<WorkerDoc[]> {
  const db = await mongoDb();
  const now = Date.now();
  if (db) {
    await db.collection("workers").deleteMany({ heartbeat: { $lt: now - STALE_MS } });
    const workers = (await db.collection("workers").find({}).toArray()) as unknown as WorkerDoc[];
    return live(workers, now);
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const workers = live(data.workers, now);
    const jobs = await reclaimStale(data.jobs, workers, now);
    await writeFileStore({ workers, jobs });
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

export async function heartbeat(input: Omit<WorkerDoc, "status" | "jobId" | "heartbeat"> & { jobId?: string | null }) {
  const now = Date.now();
  const db = await mongoDb();

  if (db) {
    const existing = (await db.collection("workers").findOne({ id: input.id })) as unknown as WorkerDoc | null;
    const doc: WorkerDoc = {
      id: input.id,
      kind: input.kind,
      adapter: input.adapter,
      cores: input.cores,
      wallet: input.wallet,
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
    const doc: WorkerDoc = {
      id: input.id,
      kind: input.kind,
      adapter: input.adapter,
      cores: input.cores,
      wallet: input.wallet,
      status: existing?.status === "busy" && existing.jobId ? "busy" : "idle",
      jobId: existing?.status === "busy" ? existing.jobId : null,
      heartbeat: now,
    };
    const workers = [...data.workers.filter((w) => w.id !== input.id), doc];
    const jobs = await reclaimStale(data.jobs, workers, now);
    const assigned = assign(jobs, workers, now);
    await writeFileStore(assigned);
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
      await db.collection("jobs").updateOne(
        { id: existing.jobId, status: "running" },
        { $set: { status: "open", workerId: null, workerKind: null, updatedAt: now } },
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
          ? { ...j, status: "open" as const, workerId: null, workerKind: null, updatedAt: now }
          : j,
      );
    }
    const workers = data.workers.filter((w) => w.id !== id);
    const assigned = assign(jobs, workers, now);
    await writeFileStore(assigned);
  });
}

export async function createJob(input: Omit<JobDoc, "id" | "status" | "workerId" | "workerKind" | "createdAt" | "updatedAt">) {
  const now = Date.now();
  const job: JobDoc = {
    ...input,
    id: crypto.randomUUID(),
    status: "open",
    workerId: null,
    workerKind: null,
    createdAt: now,
    updatedAt: now,
  };
  const db = await mongoDb();
  if (db) {
    await db.collection("jobs").insertOne(job);
    await assignMongo(db, now);
    return (await db.collection("jobs").findOne({ id: job.id })) as unknown as JobDoc;
  }
  return withFileLock(async () => {
    const data = await readFileStore();
    const jobs = [job, ...data.jobs];
    const assigned = assign(jobs, data.workers, now);
    await writeFileStore(assigned);
    return assigned.jobs.find((j) => j.id === job.id) ?? job;
  });
}

async function assignMongo(db: Db, now: number) {
  await db.collection("workers").deleteMany({ heartbeat: { $lt: now - STALE_MS } });
  const workers = (await db.collection("workers").find({}).toArray()) as unknown as WorkerDoc[];
  const jobs = (await db.collection("jobs").find({}).toArray()) as unknown as JobDoc[];
  const reclaimed = await reclaimStale(jobs, workers, now);
  for (const job of reclaimed) {
    if (job.status === "open" && jobs.find((j) => j.id === job.id)?.status === "running") {
      await db.collection("jobs").updateOne(
        { id: job.id },
        { $set: { status: "open", workerId: null, workerKind: null, updatedAt: now } },
      );
    }
  }
  const idle = live(workers, now).filter((w) => w.status === "idle" || !w.jobId);
  const open = reclaimed.filter((j) => j.status === "open").sort((a, b) => a.createdAt - b.createdAt);
  for (const job of open) {
    const worker = idle.shift();
    if (!worker) break;
    await db.collection("jobs").updateOne(
      { id: job.id },
      { $set: { status: "running", workerId: worker.id, workerKind: worker.kind, updatedAt: now } },
    );
    await db.collection("workers").updateOne(
      { id: worker.id },
      { $set: { status: "busy", jobId: job.id } },
    );
  }
}

export function usingMongo() {
  return Boolean(uri());
}
