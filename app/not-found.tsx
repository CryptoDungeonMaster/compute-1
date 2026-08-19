import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 pt-16">
      <div className="max-w-md">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-4xl font-light italic text-ivory">
          This page is not on the mesh.
        </h1>
        <p className="mt-4 text-stone">Return home, or open Earn and Rent from the menu.</p>
        <div className="mt-8">
          <Button href="/">Home</Button>
        </div>
      </div>
    </div>
  );
}
