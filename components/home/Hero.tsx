"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <Image
        src="/hero.jpg"
        alt="A quiet glass tablet in a dark field"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />

      <div className="relative mx-auto flex w-full max-w-page flex-1 flex-col justify-end px-6 pb-20 pt-28 md:justify-center md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full min-w-0 max-w-2xl"
        >
          <p className="eyebrow">Solana · WebGPU</p>
          <h1 className="mt-6 font-display text-4xl font-light italic leading-[1.08] text-ivory sm:text-6xl md:text-[5.25rem]">
            Turn a quiet tab
            <br />
            into power.
          </h1>
          <p className="mt-7 w-full min-w-0 max-w-lg text-base leading-relaxed text-stone md:text-lg">
            Open a browser. Share unused CPU and GPU. Earn TP and SOL, or pay
            to run inference, rendering, and data jobs across other people’s
            open tabs. Nothing to install.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/earn">Start earning</Button>
            <Button href="/rent" variant="secondary">
              Rent compute
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
