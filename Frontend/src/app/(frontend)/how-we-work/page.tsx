import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "A consultative engineering process: Understand, Design, Engineer, Deploy, Support — how Digibuggy Enterprise turns a workload into infrastructure.",
};

const STEPS = [
  {
    n: "01",
    title: "Understand",
    desc: "We start with your workload, not a spec sheet.",
    points: [
      "Applications and software you run",
      "Performance requirements and bottlenecks",
      "Current infrastructure and pain points",
      "Business requirements — budget, timeline, environment",
    ],
  },
  {
    n: "02",
    title: "Design",
    desc: "We translate the workload into an infrastructure profile.",
    points: [
      "Compute requirements — CPU cores, clock speed, parallelism",
      "GPU requirements — VRAM, count, interconnect",
      "Memory sizing for datasets and working sets",
      "Storage type and throughput",
      "Networking and scalability pattern",
    ],
  },
  {
    n: "03",
    title: "Engineer",
    desc: "We configure, validate and integrate before anything ships.",
    points: [
      "Component selection and compatibility validation",
      "Performance benchmarking against your workload",
      "Integration with existing environment",
      "Documentation and handover planning",
    ],
  },
  {
    n: "04",
    title: "Deploy",
    desc: "We rack, install and commission in your environment.",
    points: [
      "On-site or remote installation",
      "Network and storage integration",
      "Environment-specific configuration",
      "Acceptance testing",
    ],
  },
  {
    n: "05",
    title: "Support",
    desc: "We stay involved as your workload — and your team — grows.",
    points: [
      "Monitoring and proactive maintenance",
      "Scaling plans for future growth",
      "Priority support for production environments",
    ],
  },
];

export default function HowWeWorkPage() {
  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>How We Work</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A consultative engineering process, not a hardware order.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            We&rsquo;re not selling parts off a list. Every deployment goes through the same five
            stages — because understanding the workload correctly is what makes the infrastructure
            correct.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page space-y-16">
          {STEPS.map((step) => (
            <div key={step.n} className="grid gap-8 border-t border-border pt-12 lg:grid-cols-[auto_1fr]">
              <div className="flex items-start gap-4 lg:w-64">
                <span className="font-mono text-4xl font-semibold text-border">{step.n}</span>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted">{step.desc}</p>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {step.points.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-foreground/80">
                    <span className="text-accent-2">—</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to start with Step 01?</h2>
            <p className="mt-2 text-muted">Tell us about your workload — that&rsquo;s where every engagement begins.</p>
          </div>
          <ButtonLink href="/contact">Talk to an Expert</ButtonLink>
        </div>
      </section>
    </>
  );
}
