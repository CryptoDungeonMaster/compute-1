export type DeviceInfo = {
  webgpu: boolean;
  label: string;
  cores: number | null;
  capacityTflops: number;
};

type GpuAdapterLike = {
  requestAdapter: () => Promise<{
    info?: { vendor?: string; architecture?: string; device?: string };
  } | null>;
};

export async function readDeviceInfo(): Promise<DeviceInfo> {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || null : null;
  const gpu = typeof navigator !== "undefined"
    ? (navigator as Navigator & { gpu?: GpuAdapterLike }).gpu
    : undefined;

  if (!gpu) {
    return { webgpu: false, label: "WebGPU not available in this browser", cores, capacityTflops: 0 };
  }

  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return { webgpu: false, label: "No GPU adapter found", cores, capacityTflops: 0 };
    }

    const parts = [adapter.info?.vendor, adapter.info?.architecture, adapter.info?.device]
      .map((part) => part?.trim())
      .filter(Boolean) as string[];

    return {
      webgpu: true,
      label: parts.length ? parts.join(" · ") : "WebGPU adapter",
      cores,
      capacityTflops: Math.max(0.25, (cores || 1) * 0.2),
    };
  } catch {
    return { webgpu: false, label: "WebGPU request was blocked", cores, capacityTflops: 0 };
  }
}
