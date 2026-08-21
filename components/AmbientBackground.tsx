export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030504]" />
      <div className="square-grid absolute inset-0 opacity-35" />
      <div className="noise-layer absolute inset-0 opacity-[.035]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gold/20" />
    </div>
  );
}
