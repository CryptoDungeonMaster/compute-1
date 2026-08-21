export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030504]" />
      <div className="ambient-orb absolute left-[12%] top-[-12rem] h-[38rem] w-[38rem] rounded-full bg-gold/[0.08] blur-[120px]" />
      <div className="ambient-orb-delayed absolute -right-32 top-[32%] h-[34rem] w-[34rem] rounded-full bg-[#7047eb]/[0.075] blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.022)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
      <div className="noise-layer absolute inset-0 opacity-[.035]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
    </div>
  );
}
