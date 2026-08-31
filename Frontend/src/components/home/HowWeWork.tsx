import { Search, Ruler, Wrench, Truck, LifeBuoy } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const STEPS = [
  { icon: Search, n: "01", title: "Understand", desc: "Your workload, applications and performance requirements." },
  { icon: Ruler, n: "02", title: "Design", desc: "Compute, storage, networking and data protection, sized correctly." },
  { icon: Wrench, n: "03", title: "Engineer", desc: "Configuration, validation and integration before anything ships." },
  { icon: Truck, n: "04", title: "Deploy", desc: "Racked, installed and commissioned in your environment." },
  { icon: LifeBuoy, n: "05", title: "Support", desc: "Monitored, maintained and scaled as your workload grows." },
];

export function HowWeWork() {
  return (
    <section className="border-b border-border py-24">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>How We Work</Eyebrow>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Not a hardware order. An engineering process.
              </h2>
            </div>
            <ButtonLink href="/how-we-work" variant="secondary">
              See the full process
            </ButtonLink>
          </div>
        </Reveal>

        <RevealGroup className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step) => (
              <RevealItem key={step.n} className="relative">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-background text-accent-2">
                  <step.icon size={18} strokeWidth={1.75} />
                </div>
                <div className="mt-4 font-mono text-xs text-muted">{step.n}</div>
                <div className="font-display mt-1 font-medium text-foreground">{step.title}</div>
                <p className="mt-2 text-sm text-muted">{step.desc}</p>
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
