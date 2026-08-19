"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ivory text-ink hover:bg-white border-transparent",
  secondary:
    "bg-transparent text-ivory border-ivory/20 hover:border-gold/70 hover:text-gold",
  ghost: "bg-transparent text-ivory/70 border-transparent hover:text-ivory",
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
    "inline-flex items-center justify-center gap-2 rounded-sm border px-5 py-2.5 text-[13px] tracking-[0.08em] uppercase transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
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

export function Panel({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={cn("panel rounded-sm p-6 md:p-8", className)}>
      {children}
    </div>
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
      className={cn("relative mx-auto w-full max-w-page px-6 py-20 md:py-28", className)}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl font-light italic leading-[1.15] text-ivory md:text-5xl">
        {title}
      </h2>
      {copy ? (
        <p className="mt-5 text-base leading-relaxed text-stone md:text-lg">{copy}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-start rounded-sm px-8 py-14">
      <div className="mb-6 h-px w-12 bg-gold/70" />
      <h3 className="font-display text-2xl font-light italic text-ivory">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">{copy}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function StatusPill({
  children,
  live = false,
}: {
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-ivory/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone">
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-gold" : "bg-ivory/25")} />
      {children}
    </span>
  );
}
