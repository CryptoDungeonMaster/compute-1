import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 pt-16">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-4xl text-white">Tab not found</h1>
        <p className="mt-3 text-white/55">
          That route is not on the mesh. Head back to the network home.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Return home</Button>
        </div>
      </div>
    </div>
  );
}
