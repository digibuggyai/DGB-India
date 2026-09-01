import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getIndustries } from "@/lib/content";

const FALLBACK = [
  { slug: "architecture-engineering", name: "Architecture & Engineering", tagline: "CAD, BIM and simulation at scale.", image: null as string | null },
  { slug: "vfx-animation", name: "VFX & Animation", tagline: "Rendering, simulation and compositing pipelines.", image: null },
  { slug: "ai-machine-learning", name: "AI & Machine Learning", tagline: "Training, fine-tuning and inference infrastructure.", image: null },
  { slug: "trading-finance", name: "Trading & Finance", tagline: "Low-latency compute for quant and trading desks.", image: null },
  { slug: "media-production", name: "Media & Production", tagline: "Editing, color and delivery at broadcast scale.", image: null },
];

export async function WhoWeServe() {
  const industries = await getIndustries();
  const items = industries.length
    ? industries.map((i) => ({
        slug: i.slug ?? "",
        name: i.name,
        tagline: i.tagline ?? "",
        image: typeof i.heroImage === "object" && i.heroImage?.url ? i.heroImage.url : null,
      }))
    : FALLBACK;

  return (
    <section className="border-b border-border py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Who We Serve</Eyebrow>
          <h2 className="font-display mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for teams whose workloads outgrow generic hardware.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((ind, i) => (
            <RevealItem key={ind.slug}>
              <Link
                href={`/industries/${ind.slug}`}
                className="flip-card group block h-72 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flip-card-inner h-full w-full">
                  {/* Front */}
                  <div className="flip-card-face flip-card-front h-full w-full overflow-hidden rounded-xl border border-border">
                    <div
                      className="relative flex h-full w-full flex-col justify-end bg-cover bg-center p-5"
                      style={{
                        backgroundImage: ind.image
                          ? `linear-gradient(to top, rgba(32,35,38,0.92), rgba(32,35,38,0.15)), url(${ind.image})`
                          : "linear-gradient(160deg, #2e3236, #202326)",
                      }}
                    >
                      <span className="text-xs font-semibold tracking-widest text-white/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="font-display mt-1 text-lg font-semibold text-white">{ind.name}</div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-face flip-card-back flex h-full w-full flex-col justify-between rounded-xl border-t-[3px] border-accent bg-ink-800 p-5">
                    <div>
                      <div className="font-display text-base font-semibold text-white">{ind.name}</div>
                      <p className="mt-2 text-sm text-ink-muted-2">{ind.tagline}</p>
                    </div>
                    <span className="text-sm font-medium text-white">Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
