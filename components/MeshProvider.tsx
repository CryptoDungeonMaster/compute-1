"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { readDeviceInfo, type DeviceInfo } from "@/lib/device";
import {
  getTabId,
  matchJob,
  MESH_EVENT,
  MeshJob,
  MeshWorker,
  readJob,
  readWorkers,
  SHARING_KEY,
  writeJob,
  writeWorkers,
} from "@/lib/mesh";

type MeshContextValue = {
  device: DeviceInfo | null;
  sharing: boolean;
  workers: MeshWorker[];
  job: MeshJob | null;
  tabId: string | null;
  startSharing: () => void;
  stopSharing: () => void;
  submitJob: (input: {
    prompt: string;
    budget: string;
    currency: "SOL" | "TP";
    fileName: string | null;
  }) => void;
};

const MeshContext = createContext<MeshContextValue | null>(null);

export function MeshProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [sharing, setSharing] = useState(false);
  const [workers, setWorkers] = useState<MeshWorker[]>([]);
  const [job, setJob] = useState<MeshJob | null>(null);
  const [tabId, setTabId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const live = readWorkers();
    setWorkers(live);
    const current = readJob();
    if (current && current.status === "waiting" && live.length > 0) {
      const matched = matchJob(current, live);
      writeJob(matched);
      setJob(matched);
      return;
    }
    setJob(current);
  }, []);

  useEffect(() => {
    setTabId(getTabId());
    setSharing(localStorage.getItem(SHARING_KEY) === "1");
    refresh();
    readDeviceInfo().then(setDevice);

    const onChange = () => refresh();
    window.addEventListener(MESH_EVENT, onChange);
    window.addEventListener("storage", onChange);
    const poll = window.setInterval(onChange, 1000);
    return () => {
      window.removeEventListener(MESH_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.clearInterval(poll);
    };
  }, [refresh]);

  useEffect(() => {
    if (!sharing || !tabId || !device) return;

    const beat = () => {
      const others = readWorkers().filter((w) => w.id !== tabId);
      writeWorkers([
        ...others,
        {
          id: tabId,
          adapter: device.label,
          cores: device.cores,
          webgpu: device.webgpu,
          heartbeat: Date.now(),
        },
      ]);
    };

    beat();
    const timer = window.setInterval(beat, 2500);
    return () => {
      window.clearInterval(timer);
      writeWorkers(readWorkers().filter((w) => w.id !== tabId));
    };
  }, [sharing, tabId, device]);

  const startSharing = useCallback(() => {
    localStorage.setItem(SHARING_KEY, "1");
    setSharing(true);
  }, []);

  const stopSharing = useCallback(() => {
    localStorage.removeItem(SHARING_KEY);
    setSharing(false);
    if (tabId) writeWorkers(readWorkers().filter((w) => w.id !== tabId));
  }, [tabId]);

  const submitJob = useCallback(
    (input: {
      prompt: string;
      budget: string;
      currency: "SOL" | "TP";
      fileName: string | null;
    }) => {
      const live = readWorkers();
      const next = matchJob(
        {
          prompt: input.prompt.trim(),
          budget: input.budget.trim(),
          currency: input.currency,
          fileName: input.fileName,
          workerIds: [],
          status: "waiting",
          createdAt: Date.now(),
        },
        live,
      );
      writeJob(next);
      setJob(next);
    },
    [],
  );

  const value = useMemo(
    () => ({
      device,
      sharing,
      workers,
      job,
      tabId,
      startSharing,
      stopSharing,
      submitJob,
    }),
    [device, sharing, workers, job, tabId, startSharing, stopSharing, submitJob],
  );

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}

export function useMesh() {
  const ctx = useContext(MeshContext);
  if (!ctx) {
    throw new Error("useMesh must be used within MeshProvider");
  }
  return ctx;
}
