export type WorkerKind = "webgpu" | "native";
export type WorkerStatus = "idle" | "busy";
export type JobStatus = "open" | "running" | "done";

export type WorkerDoc = {
  id: string;
  kind: WorkerKind;
  adapter: string;
  cores: number | null;
  wallet: string | null;
  status: WorkerStatus;
  jobId: string | null;
  heartbeat: number;
};

export type JobDoc = {
  id: string;
  prompt: string;
  modelSource: string;
  fileName: string;
  budget: string;
  lamports: number;
  paySignature: string;
  wallet: string | null;
  status: JobStatus;
  workerId: string | null;
  workerKind: WorkerKind | null;
  proof: string | null;
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
