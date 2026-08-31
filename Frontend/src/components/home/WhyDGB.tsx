import { Compass, Wrench, Gauge, TrendingUp } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const POINTS = [
  {
    icon: Compass,
    title: "Workload-Driven",
    desc: "Every recommendation starts with what you run — not a catalog of parts.",
  },
  {
    icon: Wrench,
    title: "Purpose-Built",
    desc: "Compute, storage and networking configured for your specific applications.",
  },
  {
    icon: Gauge,
    title: "Performance-Focused",
    desc: "Sized against real bottlenecks — VRAM, IOPS, bandwidth — not spec-sheet averages.",
  },
  {
    icon: TrendingUp,
    title: "Built to Scale",
    desc: "Architected so the next phase of growth is an expansion, not a replacement.",
  },
];

export function WhyDGB() {
  return (
    <section className="border-b border-border bg-surface py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Why DGB India</Eyebrow>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            An infrastructure partner, not a hardware vendor.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <RevealItem key={p.title}>
              <SpotlightCard className="card-depth h-full rounded-xl border border-border bg-background p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-raised text-accent-2">
                  <p.icon size={18} strokeWidth={1.75} />
                </span>
                <div className="font-display mt-4 font-medium text-foreground">{p.title}</div>
                <p className="mt-2 text-sm text-muted">{p.desc}</p>
              </SpotlightCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
