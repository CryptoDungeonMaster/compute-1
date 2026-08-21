export type WorkerKind = "webgpu" | "native";
export type WorkerStatus = "idle" | "busy";
export type JobStatus = "open" | "running" | "done" | "killed";

export type WorkerDoc = {
  id: string;
  kind: WorkerKind;
  adapter: string;
  cores: number | null;
  capacityTflops: number;
  wallet: string | null;
  name: string;
  authToken?: string;
  status: WorkerStatus;
  jobId: string | null;
  heartbeat: number;
};

export type JobDoc = {
  id: string;
  prompt: string;
  modelSource: string;
  fileName: string;
  fileData: string | null;
  budget: string;
  currency: "SOL";
  lamports: number;
  paySignature: string;
  accessToken: string;
  wallet: string | null;
  status: JobStatus;
  workerId: string | null;
  workerIds: string[];
  completedWorkerIds: string[];
  workerKind: WorkerKind | null;
  proof: string | null;
  progress: number;
  parallelism: number;
  estimatedDurationMs: number;
  startedAt: number | null;
  readyAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type LedgerEntry = {
  id: string;
  wallet: string;
  lamports: number;
  kind: "credit" | "payout";
  jobId: string | null;
  sig: string | null;
  createdAt: number;
};

export type Earnings = {
  availableLamports: number;
  earnedTodayLamports: number;
  lifetimeLamports: number;
  jobsCompleted: number;
  entries: LedgerEntry[];
};
