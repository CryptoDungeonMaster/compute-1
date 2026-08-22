import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/home/Hero";
import { ProtocolProduct } from "@/components/home/ProtocolProduct";

export default function HomePage() {
  return (
    <PageShell className="pt-0">
      <Hero />
      <ProtocolProduct />
    </PageShell>
  );
}
