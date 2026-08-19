export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div className="absolute left-1/2 top-[-18%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[140px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </div>
  );
}
