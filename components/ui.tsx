"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "green" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue text-white shadow-glow hover:bg-[#2563eb] border-transparent",
  secondary:
    "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20",
  green:
    "bg-accent-green text-ink shadow-glow-green hover:bg-[#16a34a] border-transparent",
  ghost: "bg-transparent text-white/80 border-white/10 hover:bg-white/5",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function GlassCard({
  children,
  className,
  hover = false,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn("glass rounded-2xl p-6", className)}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {copy ? (
        <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">{copy}</p>
      ) : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "purple" | "muted";
}) {
  const tones = {
    blue: "bg-accent-blue/10 text-accent-blue ring-accent-blue/20",
    green: "bg-accent-green/10 text-accent-green ring-accent-green/20",
    purple: "bg-accent-purple/10 text-accent-purple ring-accent-purple/20",
    muted: "bg-white/5 text-white/60 ring-white/10",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  copy,
  action,
  icon,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-white/70 ring-1 ring-white/10">
        {icon}
      </div>
      <h3 className="font-display text-xl text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-white/55">{copy}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "blue",
}: {
  value: number;
  tone?: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: "bg-accent-blue",
    green: "bg-accent-green",
    purple: "bg-accent-purple",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={cn("h-full rounded-full transition-all duration-500", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
