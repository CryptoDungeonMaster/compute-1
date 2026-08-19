import { Image as ImageIcon } from "lucide-react";
import { Panel } from "@/components/ui";

export function ImageComingSoon() {
  return <Panel className="mt-4 border-gold/25"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Image generation</p><h2 className="mt-2 font-display text-2xl italic text-ivory">Coming soon</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone">ComfyUI is being connected to the worker network. Soon you will be able to send an image prompt, watch the job run, and receive the generated image here.</p></div><ImageIcon className="text-gold" size={26}/></div></Panel>;
}
