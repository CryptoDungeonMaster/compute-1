import { PageShell } from "@/components/PageShell";
import { Mesh } from "@/components/home/Mesh";
import { Market } from "@/components/home/Market";

export const metadata = {
  title: "Network · ComputeFi",
  description: "Live capacity and job routing across the ComputeFi worker mesh.",
};

export default function NetworkPage() {
  return <PageShell><div className="pt-16"><Mesh /><Market /></div></PageShell>;
}
