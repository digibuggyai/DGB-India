import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const POINTS = [
  { title: "Workload-Driven", desc: "We start with your work, not a predefined product." },
  { title: "Purpose-Built", desc: "Every solution is designed around your specific requirements." },
  { title: "Performance-Focused", desc: "Infrastructure engineered to handle demanding workloads efficiently." },
  { title: "Built to Scale", desc: "Solutions designed to grow as your workloads evolve." },
];

export function WhyDGB() {
  return (
    <section className="border-b border-border bg-surface py-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow>Why DGB India</Eyebrow>
            <h2 className="font-display mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Built Around What You Need.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              No one-size-fits-all solutions. We design infrastructure around your workload,
              performance requirements and future needs.
            </p>
          </Reveal>

          <RevealGroup className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {POINTS.map((p) => (
              <RevealItem key={p.title}>
                <div className="border-t border-[#dcdfe2] pt-[22px]">
                  <div className="font-display font-medium text-foreground">{p.title}</div>
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
