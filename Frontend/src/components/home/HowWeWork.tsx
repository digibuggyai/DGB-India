import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const STEPS = [
  { n: "01", title: "Understand", desc: "Your workload, goals and requirements." },
  { n: "02", title: "Design", desc: "The right infrastructure for your needs." },
  { n: "03", title: "Deploy", desc: "Integrate and implement your solution." },
  { n: "04", title: "Support", desc: "Keep your infrastructure running and evolving." },
];

export function HowWeWork() {
  return (
    <section className="border-b border-border bg-ink-800 py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>How We Work</Eyebrow>
          <h2 className="font-display mt-4 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From Requirement to Solution.
          </h2>
          <p className="mt-3 max-w-lg text-ink-muted-2">
            We understand your workload, design the right infrastructure, and bring it to life.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-2 gap-px bg-[#43484d] lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <RevealItem key={step.n}>
              <div className="flip-card h-[250px] w-full" style={{ perspective: "1200px" }}>
                <div className="flip-card-inner h-full w-full">
                  <div
                    className="flip-card-face flip-card-front flex h-full w-full flex-col justify-end bg-ink-800 p-6"
                    style={{ borderTop: `2px solid ${i === 0 ? "#80202c" : "#43484d"}` }}
                  >
                    <div className="font-display text-[34px] font-bold text-[#43484d]">{step.n}</div>
                    <div className="font-display mt-2 text-[19px] font-semibold text-white">{step.title}</div>
                  </div>
                  <div
                    className="flip-card-face flip-card-back flex h-full w-full flex-col justify-end bg-accent p-6"
                    style={{ borderTop: `2px solid ${i === 0 ? "#80202c" : "#43484d"}` }}
                  >
                    <div className="font-display text-[34px] font-bold text-white/60">{step.n}</div>
                    <p className="mt-2 text-base font-medium text-white">{step.desc}</p>
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
