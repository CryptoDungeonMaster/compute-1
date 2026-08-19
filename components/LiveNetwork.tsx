"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityItem,
  INITIAL_ACTIVITY,
  INITIAL_STATS,
  makeActivity,
} from "@/lib/mock";

type LiveState = {
  workers: number;
  computeHours: number;
  tokens: number;
  jobsPerMin: number;
  activity: ActivityItem[];
};

const LiveNetworkContext = createContext<LiveState | null>(null);

export function LiveNetworkProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LiveState>(() => ({
    ...INITIAL_STATS,
    activity: INITIAL_ACTIVITY.map((item, i) => ({
      ...item,
      createdAt: 1_700_000_000_000 - (i + 1) * 14_000,
    })),
  }));

  useEffect(() => {
    const start = Date.now();
    setState((prev) => ({
      ...prev,
      activity: prev.activity.map((item, i) => ({
        ...item,
        createdAt: start - (i + 1) * 14_000,
      })),
    }));

    const timer = window.setInterval(() => {
      setState((prev) => {
        const next = makeActivity();
        return {
          workers: prev.workers + (Math.random() > 0.62 ? 1 : 0),
          computeHours: prev.computeHours + Math.random() * 1.8,
          tokens: prev.tokens + Math.random() * 6,
          jobsPerMin: Math.max(
            28,
            Math.min(64, prev.jobsPerMin + (Math.random() * 4 - 2)),
          ),
          activity: [next, ...prev.activity].slice(0, 12),
        };
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <LiveNetworkContext.Provider value={value}>
      {children}
    </LiveNetworkContext.Provider>
  );
}

export function useLiveNetwork() {
  const ctx = useContext(LiveNetworkContext);
  if (!ctx) {
    return {
      ...INITIAL_STATS,
      activity: [] as ActivityItem[],
    };
  }
  return ctx;
}
