"use client";

import { useEffect, useState } from "react";
import { readDeviceInfo } from "@/lib/device";

export function WebGpuStatus() {
  const [label, setLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readDeviceInfo().then((info) => {
      setReady(info.webgpu);
      setLabel(info.webgpu ? "WebGPU ready" : "WebGPU unavailable");
    });
  }, []);

  if (!label) return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 hidden md:block">
      <div className="flex items-center gap-2 border border-ivory/15 bg-ink/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone backdrop-blur-md">
        <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-gold" : "bg-ivory/25"}`} />
        {label}
      </div>
    </div>
  );
}
