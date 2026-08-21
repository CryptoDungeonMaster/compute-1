"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Button, Panel } from "@/components/ui";

export function ImageComingSoon() {
  const [prompt, setPrompt] = useState(""); const [image, setImage] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async () => { if (!prompt.trim()) return; setBusy(true); setMessage("Generating image…"); setImage(""); try { const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "image", prompt }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Image generation failed."); setImage(data.dataUrl); setMessage(data.cost != null ? `Image generated · ${Number(data.cost).toFixed(4)} USD provider cost` : "Image generated."); } catch (error) { setMessage(error instanceof Error ? error.message : "Image generation failed."); } finally { setBusy(false); } };
  return <Panel className="mt-4"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">ComputeFi AI</p><h2 className="mt-2 font-display text-2xl italic text-ivory">Image generation</h2></div><ImageIcon className="text-gold" size={24}/></div><p className="mt-3 text-sm leading-relaxed text-stone">Create an image with ComputeFi&apos;s hosted image model. No GPU or model download required.</p><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} placeholder="Describe the image you want to create…" className="mt-6 w-full resize-none border border-ivory/10 bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-stone/50 focus:border-gold/50"/><div className="mt-3 flex items-center gap-3"><Button onClick={submit} disabled={busy || !prompt.trim()}>{busy ? "Generating" : "Generate image"}</Button>{message ? <p className="text-sm text-stone">{message}</p> : null}</div>{image ? <div className="relative mt-6 aspect-square max-w-xl overflow-hidden border border-ivory/10 bg-black"><Image src={image} alt={prompt} fill unoptimized className="object-contain" /></div> : null}</Panel>;
}
