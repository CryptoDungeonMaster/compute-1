export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center pt-16">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-accent-blue" />
        <p className="text-sm text-white/40">Syncing the mesh…</p>
      </div>
    </div>
  );
}
