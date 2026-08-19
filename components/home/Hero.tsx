"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui";

export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <Image
        src="/hero.jpg"
        alt="TabPower decentralized browser compute network"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/82 to-[#050505]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/55" />

      <div className="relative mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col justify-center px-6 pb-8 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full min-w-0 max-w-2xl"
        >
          <p className="eyebrow">Browser-native compute · Solana</p>
          <h1 className="mt-4 max-w-full font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
            Turn Your Browser Into Income
          </h1>
          <p className="mt-5 w-full max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Open a tab and rent unused CPU and GPU. Earn a custom pump.fun
            token plus SOL. Need power? Pay in SOL or PF to run AI inference,
            rendering, and data jobs across other people’s browsers — WebGPU
            only, nothing to install.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/earn" variant="green" className="px-6 py-3">
              Start Earning
              <ArrowRight size={16} />
            </Button>
            <Button href="/rent" variant="secondary" className="px-6 py-3">
              Rent Compute
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/55">
            <span className="inline-flex items-center gap-2">
              <Zap size={14} className="text-accent-green" />
              No download
            </span>
            <span className="inline-flex items-center gap-2">
              <Cpu size={14} className="text-accent-blue" />
              WebGPU in-tab
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent-purple" />
              Escrowed jobs
            </span>
          </div>
        </motion.div>
      </div>
      {children ? (
        <div className="relative z-10 w-full pb-16 md:pb-20">{children}</div>
      ) : null}
    </section>
  );
}
