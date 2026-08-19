export type MeshWorker = {
  id: string;
  adapter: string;
  cores: number | null;
  webgpu: boolean;
  heartbeat: number;
};

export type MeshJob = {
  prompt: string;
  budget: string;
  currency: "SOL" | "TP";
  fileName: string | null;
  workerIds: string[];
  status: "waiting" | "matched";
  createdAt: number;
};

export const WORKERS_KEY = "tappower.workers";
export const JOB_KEY = "tappower.job";
export const SHARING_KEY = "tappower.sharing";
export const TAB_ID_KEY = "tappower.tabId";
export const MESH_EVENT = "tappower-mesh";
export const STALE_MS = 12_000;

export function getTabId() {
  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
}

export function readWorkers(): MeshWorker[] {
  try {
    const raw = localStorage.getItem(WORKERS_KEY);
    const list: MeshWorker[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    return list.filter((w) => now - w.heartbeat < STALE_MS);
  } catch {
    return [];
  }
}

export function writeWorkers(list: MeshWorker[]) {
  const live = list.filter((w) => Date.now() - w.heartbeat < STALE_MS);
  localStorage.setItem(WORKERS_KEY, JSON.stringify(live));
  window.dispatchEvent(new Event(MESH_EVENT));
}

export function readJob(): MeshJob | null {
  try {
    const raw = localStorage.getItem(JOB_KEY);
    return raw ? (JSON.parse(raw) as MeshJob) : null;
  } catch {
    return null;
  }
}

export function writeJob(job: MeshJob | null) {
  if (job) localStorage.setItem(JOB_KEY, JSON.stringify(job));
  else localStorage.removeItem(JOB_KEY);
  window.dispatchEvent(new Event(MESH_EVENT));
}

export function matchJob(job: MeshJob, workers: MeshWorker[]): MeshJob {
  if (workers.length === 0) {
    return { ...job, workerIds: [], status: "waiting" };
  }
  return {
    ...job,
    workerIds: workers.map((w) => w.id),
    status: "matched",
  };
}
