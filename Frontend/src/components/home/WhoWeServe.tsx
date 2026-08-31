import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getIndustryIcon } from "@/lib/icons";
import { getIndustries } from "@/lib/content";

const FALLBACK = [
  { slug: "architecture-engineering", name: "Architecture & Engineering", tagline: "CAD, BIM and simulation at scale." },
  { slug: "vfx-animation", name: "VFX & Animation", tagline: "Rendering, simulation and compositing pipelines." },
  { slug: "ai-machine-learning", name: "AI & Machine Learning", tagline: "Training, fine-tuning and inference infrastructure." },
  { slug: "trading-finance", name: "Trading & Finance", tagline: "Low-latency compute for quant and trading desks." },
  { slug: "media-production", name: "Media & Production", tagline: "Editing, color and delivery at broadcast scale." },
];

export async function WhoWeServe() {
  const industries = await getIndustries();
  const items = industries.length
    ? industries.map((i) => ({ slug: i.slug ?? "", name: i.name, tagline: i.tagline ?? "" }))
    : FALLBACK;

  return (
    <section className="border-b border-border py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Who We Serve</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for teams whose workloads outgrow generic hardware.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((ind, i) => {
            const Icon = getIndustryIcon(ind.slug);
            return (
              <RevealItem key={ind.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                <SpotlightCard
                  as={Link}
                  href={`/industries/${ind.slug}`}
                  className={`card-depth flex h-full flex-col justify-between rounded-xl border border-border bg-surface p-7 transition-colors hover:border-border-strong ${
                    i === 0 ? "min-h-[15rem]" : "min-h-[11rem]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface-raised text-accent-2">
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  <div>
                    <div className="font-display text-lg font-medium text-foreground">{ind.name}</div>
                    <p className="mt-2 text-sm text-muted">{ind.tagline}</p>
                  </div>
                </SpotlightCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
