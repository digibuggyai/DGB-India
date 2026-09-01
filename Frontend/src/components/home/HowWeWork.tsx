import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const STEPS = [
  { n: "01", title: "Understand", desc: "Your workload, applications and performance requirements." },
  { n: "02", title: "Design", desc: "Compute, storage, networking and data protection, sized correctly." },
  { n: "03", title: "Engineer & Deploy", desc: "Configured, validated and commissioned in your environment." },
  { n: "04", title: "Support", desc: "Monitored, maintained and scaled as your workload grows." },
];

export function HowWeWork() {
  return (
    <section className="border-b border-border bg-ink-800 py-24">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>How We Work</Eyebrow>
              <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Not a hardware order. An engineering process.
              </h2>
            </div>
            <ButtonLink href="/how-we-work" variant="secondary" className="border-white/30 !text-white hover:border-white">
              See the full process
            </ButtonLink>
          </div>
        </Reveal>

        <RevealGroup className="mt-16 grid divide-y divide-[#43484d] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {STEPS.map((step) => (
            <RevealItem key={step.n} className="px-0 py-8 sm:px-6 sm:py-0">
              <div className="flip-card h-48 w-full">
                <div className="flip-card-inner h-full w-full">
                  <div className="flip-card-face flip-card-front flex h-full w-full flex-col justify-end">
                    <div className="font-display text-5xl font-bold text-white/15">{step.n}</div>
                    <div className="font-display mt-2 text-lg font-medium text-white">{step.title}</div>
                  </div>
                  <div className="flip-card-face flip-card-back flex h-full w-full flex-col justify-center rounded-lg bg-accent p-5">
                    <div className="font-display text-base font-semibold text-white">{step.title}</div>
                    <p className="mt-2 text-sm text-white/85">{step.desc}</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
