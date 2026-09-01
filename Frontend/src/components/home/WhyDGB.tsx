import { Compass, Wrench, Gauge, TrendingUp } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
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
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <Eyebrow>Why DGB India</Eyebrow>
            <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Built Around What You Need.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              An infrastructure partner, not a hardware vendor — every recommendation starts with
              your workload.
            </p>
          </Reveal>

          <RevealGroup className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {POINTS.map((p) => (
              <RevealItem key={p.title}>
                <div className="border-t-2 border-accent pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tint text-accent">
                    <p.icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="font-display mt-3 font-medium text-foreground">{p.title}</div>
                  <p className="mt-2 text-sm text-muted">{p.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
