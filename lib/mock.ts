export type ActivityType = "earn" | "job" | "join" | "claim";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  actor: string;
  title: string;
  detail: string;
  createdAt: number;
};

export type WorkerNode = {
  id: string;
  name: string;
  gpu: string;
  cores: number;
  vram: string;
  rateSol: number;
  ratePf: number;
  uptime: number;
  latencyMs: number;
  jobs: number;
  region: string;
};

export type EarningRow = {
  id: string;
  job: string;
  type: string;
  pf: number;
  sol: number;
  duration: string;
  status: "Paid" | "Pending" | "Verifying";
  time: string;
};

export type DashboardJob = {
  id: string;
  name: string;
  role: "Provider" | "Requester";
  status: "Running" | "Queued" | "Complete" | "Verifying";
  progress: number;
  value: string;
};

export type TxRow = {
  id: string;
  action: string;
  amount: string;
  token: "SOL" | "PF";
  status: "Confirmed" | "Pending";
  time: string;
  sig: string;
};

export const INITIAL_STATS = {
  workers: 12847,
  computeHours: 4_281_903,
  tokens: 18_642_110,
  jobsPerMin: 42,
};

export const INITIAL_ACTIVITY: Omit<ActivityItem, "createdAt">[] = [
  {
    id: "a1",
    type: "earn",
    actor: "7xK9…a2Px",
    title: "Earned 1.24 PF",
    detail: "SDXL turbo · 11s",
  },
  {
    id: "a2",
    type: "job",
    actor: "Job #4821",
    title: "Inference complete",
    detail: "Llama-class 8B · 4 workers",
  },
  {
    id: "a3",
    type: "join",
    actor: "9mQp…kL2s",
    title: "Joined as worker",
    detail: "WebGPU · 12GB class",
  },
  {
    id: "a4",
    type: "claim",
    actor: "3fRt…n8We",
    title: "Claimed 0.041 SOL",
    detail: "Auto-claim threshold hit",
  },
  {
    id: "a5",
    type: "earn",
    actor: "5bVx…pQ91",
    title: "Earned 6.80 PF",
    detail: "Cycles render tile · 48s",
  },
  {
    id: "a6",
    type: "job",
    actor: "Job #4808",
    title: "Dataset map-reduce done",
    detail: "1.2GB parquet · 9 workers",
  },
];

export const WORKERS: WorkerNode[] = [
  {
    id: "w1",
    name: "Vertex-A",
    gpu: "WebGPU High · 24GB class",
    cores: 16,
    vram: "24 GB",
    rateSol: 0.0042,
    ratePf: 2.8,
    uptime: 99.4,
    latencyMs: 18,
    jobs: 1204,
    region: "US-East",
  },
  {
    id: "w2",
    name: "Nimbus-7",
    gpu: "WebGPU High · 16GB class",
    cores: 12,
    vram: "16 GB",
    rateSol: 0.0031,
    ratePf: 2.1,
    uptime: 98.7,
    latencyMs: 24,
    jobs: 886,
    region: "EU-West",
  },
  {
    id: "w3",
    name: "Pulse-K",
    gpu: "WebGPU Mid · 12GB class",
    cores: 8,
    vram: "12 GB",
    rateSol: 0.0022,
    ratePf: 1.4,
    uptime: 97.9,
    latencyMs: 31,
    jobs: 642,
    region: "Asia",
  },
  {
    id: "w4",
    name: "Halo-12",
    gpu: "WebGPU High · 20GB class",
    cores: 16,
    vram: "20 GB",
    rateSol: 0.0038,
    ratePf: 2.5,
    uptime: 99.1,
    latencyMs: 21,
    jobs: 1011,
    region: "US-West",
  },
  {
    id: "w5",
    name: "Drift-3",
    gpu: "WebGPU Mid · 8GB class",
    cores: 8,
    vram: "8 GB",
    rateSol: 0.0016,
    ratePf: 1.05,
    uptime: 96.8,
    latencyMs: 28,
    jobs: 390,
    region: "EU-North",
  },
  {
    id: "w6",
    name: "Forge-9",
    gpu: "WebGPU High · 16GB class",
    cores: 12,
    vram: "16 GB",
    rateSol: 0.0029,
    ratePf: 1.9,
    uptime: 98.2,
    latencyMs: 19,
    jobs: 774,
    region: "US-East",
  },
];

export const EARNINGS_HISTORY: EarningRow[] = [
  {
    id: "e1",
    job: "Job #4819",
    type: "AI Inference",
    pf: 2.4,
    sol: 0.0031,
    duration: "14s",
    status: "Paid",
    time: "2m ago",
  },
  {
    id: "e2",
    job: "Job #4812",
    type: "Rendering",
    pf: 8.1,
    sol: 0.011,
    duration: "51s",
    status: "Paid",
    time: "18m ago",
  },
  {
    id: "e3",
    job: "Job #4798",
    type: "Data Processing",
    pf: 3.6,
    sol: 0.0044,
    duration: "27s",
    status: "Verifying",
    time: "41m ago",
  },
  {
    id: "e4",
    job: "Job #4780",
    type: "AI Inference",
    pf: 1.9,
    sol: 0.0022,
    duration: "9s",
    status: "Paid",
    time: "1h ago",
  },
  {
    id: "e5",
    job: "Job #4766",
    type: "Custom Kernel",
    pf: 5.0,
    sol: 0.0068,
    duration: "33s",
    status: "Pending",
    time: "3h ago",
  },
];

export const TOKENOMICS = [
  { label: "Worker rewards", pct: 40, color: "#3B82F6" },
  { label: "Liquidity", pct: 20, color: "#22C55E" },
  { label: "Treasury", pct: 15, color: "#A855F7" },
  { label: "Team (vested)", pct: 15, color: "#64748B" },
  { label: "Ecosystem", pct: 10, color: "#38BDF8" },
];

const ACTORS = [
  "7xK9…a2Px",
  "9mQp…kL2s",
  "3fRt…n8We",
  "5bVx…pQ91",
  "2nHs…d8Lm",
  "8cYt…w3Ka",
  "4pGj…r7Qe",
  "6vBn…t1Xc",
];

const JOB_TYPES = [
  "SDXL turbo",
  "Llama-class 8B",
  "Whisper transcribe",
  "Cycles render tile",
  "CSV transform",
  "Embedding batch",
  "Upscale 4×",
  "WebGPU GEMM",
];

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export function makeActivity(now = Date.now()): ActivityItem {
  const roll = Math.random();
  const actor = pick(ACTORS);
  const job = pick(JOB_TYPES);
  const id = `${now}-${Math.floor(Math.random() * 9999)}`;

  if (roll < 0.45) {
    const pf = (Math.random() * 8 + 0.4).toFixed(2);
    return {
      id,
      type: "earn",
      actor,
      title: `Earned ${pf} PF`,
      detail: `${job} · ${Math.floor(Math.random() * 40) + 6}s`,
      createdAt: now,
    };
  }
  if (roll < 0.75) {
    const n = 4700 + Math.floor(Math.random() * 200);
    return {
      id,
      type: "job",
      actor: `Job #${n}`,
      title: "Job completed",
      detail: `${job} · ${Math.floor(Math.random() * 8) + 2} workers`,
      createdAt: now,
    };
  }
  if (roll < 0.9) {
    return {
      id,
      type: "join",
      actor,
      title: "Joined as worker",
      detail: "Idle GPU advertised",
      createdAt: now,
    };
  }
  const sol = (Math.random() * 0.05 + 0.004).toFixed(3);
  return {
    id,
    type: "claim",
    actor,
    title: `Claimed ${sol} SOL`,
    detail: "Rewards unlocked",
    createdAt: now,
  };
}

export function dashboardFromSeed(seed: number) {
  const earnPf = 180 + (seed % 900) + (seed % 100) / 10;
  const earnSol = 0.12 + (seed % 80) / 1000;
  const spentSol = 0.04 + (seed % 50) / 1000;
  const spentPf = 40 + (seed % 200);

  const jobs: DashboardJob[] = [
    {
      id: "d1",
      name: "Batch embeddings · 12k rows",
      role: "Requester",
      status: "Running",
      progress: 62,
      value: "1.8 SOL",
    },
    {
      id: "d2",
      name: "Idle GPU share",
      role: "Provider",
      status: "Running",
      progress: 100,
      value: "+2.1 PF/hr",
    },
    {
      id: "d3",
      name: "Product stills · 8 frames",
      role: "Requester",
      status: "Verifying",
      progress: 94,
      value: "420 PF",
    },
    {
      id: "d4",
      name: "Whisper · 41 min audio",
      role: "Requester",
      status: "Complete",
      progress: 100,
      value: "0.21 SOL",
    },
  ];

  const txs: TxRow[] = [
    {
      id: "t1",
      action: "Job escrow",
      amount: "1.80",
      token: "SOL",
      status: "Confirmed",
      time: "12m ago",
      sig: "5nX…k2",
    },
    {
      id: "t2",
      action: "Worker payout",
      amount: "4.10",
      token: "PF",
      status: "Confirmed",
      time: "28m ago",
      sig: "3bQ…p9",
    },
    {
      id: "t3",
      action: "Claim rewards",
      amount: "0.027",
      token: "SOL",
      status: "Pending",
      time: "1h ago",
      sig: "8mL…d4",
    },
    {
      id: "t4",
      action: "PF discount payment",
      amount: "96.00",
      token: "PF",
      status: "Confirmed",
      time: "3h ago",
      sig: "2vR…c7",
    },
  ];

  return {
    earnPf,
    earnSol,
    spentSol,
    spentPf,
    claimablePf: 12 + (seed % 40),
    claimableSol: 0.008 + (seed % 20) / 1000,
    jobs,
    txs,
  };
}
