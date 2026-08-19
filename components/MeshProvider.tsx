"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { readDeviceInfo, type DeviceInfo } from "@/lib/device";
import type { JobDoc, WorkerDoc } from "@/lib/types";

type MeshContextValue = {
  device: DeviceInfo | null;
  sharing: boolean;
  workers: WorkerDoc[];
  jobs: JobDoc[];
  assignedJob: JobDoc | null;
  tabId: string | null;
  mongo: boolean;
  startSharing: () => void;
  stopSharing: () => void;
  submitJob: (input: {
    prompt: string;
    modelSource: string;
    budget: string;
    currency: "SOL" | "TP";
  }) => Promise<void>;
};

const MeshContext = createContext<MeshContextValue | null>(null);
const TAB_KEY = "tappower.tabId";
const SHARE_KEY = "tappower.sharing";

function tabId() {
  let id = sessionStorage.getItem(TAB_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(TAB_KEY, id);
  }
  return id;
}

export function MeshProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [sharing, setSharing] = useState(false);
  const [workers, setWorkers] = useState<WorkerDoc[]>([]);
  const [jobs, setJobs] = useState<JobDoc[]>([]);
  const [id, setId] = useState<string | null>(null);
  const [mongo, setMongo] = useState(false);

  const wallet = publicKey?.toBase58() ?? null;
  const assignedJob = jobs.find((j) => j.workerId === id && j.status === "running") ?? null;

  const refresh = useCallback(async () => {
    const [w, j] = await Promise.all([
      fetch("/api/workers").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]);
    setWorkers(w.workers || []);
    setJobs(j.jobs || []);
    setMongo(Boolean(w.mongo || j.mongo));
  }, []);

  useEffect(() => {
    setId(tabId());
    setSharing(localStorage.getItem(SHARE_KEY) === "1");
    readDeviceInfo().then(setDevice);
    refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!sharing || !id || !device) return;
    let stop = false;

    const beat = async () => {
      await fetch("/api/workers/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          kind: "webgpu",
          adapter: device.label,
          cores: device.cores,
          wallet,
        }),
      });
      if (!stop) await refresh();
    };

    beat();
    const timer = window.setInterval(beat, 3000);
    const leave = () => {
      stop = true;
      navigator.sendBeacon?.(
        "/api/workers/leave",
        new Blob([JSON.stringify({ id })], { type: "application/json" }),
      );
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", leave);
    };
  }, [sharing, id, device, wallet, refresh]);

  const startSharing = useCallback(() => {
    localStorage.setItem(SHARE_KEY, "1");
    setSharing(true);
  }, []);

  const stopSharing = useCallback(() => {
    localStorage.removeItem(SHARE_KEY);
    setSharing(false);
    if (id) {
      fetch("/api/workers/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then(refresh);
    }
  }, [id, refresh]);

  const submitJob = useCallback(
    async (input: {
      prompt: string;
      modelSource: string;
      budget: string;
      currency: "SOL" | "TP";
    }) => {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, wallet }),
      });
      await refresh();
    },
    [wallet, refresh],
  );

  const value = useMemo(
    () => ({
      device,
      sharing,
      workers,
      jobs,
      assignedJob,
      tabId: id,
      mongo,
      startSharing,
      stopSharing,
      submitJob,
    }),
    [
      device,
      sharing,
      workers,
      jobs,
      assignedJob,
      id,
      mongo,
      startSharing,
      stopSharing,
      submitJob,
    ],
  );

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}

export function useMesh() {
  const ctx = useContext(MeshContext);
  if (!ctx) throw new Error("useMesh must be used within MeshProvider");
  return ctx;
}
