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
  budget: string;
  currency: "SOL" | "TP";
  wallet: string | null;
  status: JobStatus;
  workerId: string | null;
  workerKind: WorkerKind | null;
  createdAt: number;
  updatedAt: number;
};
