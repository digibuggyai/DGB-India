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
          <h2 className="font-display mt-4 max-w-[18em] text-3xl font-bold tracking-tight sm:text-4xl">
            Infrastructure solutions for demanding workloads across industries.
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((ind, i) => (
            <RevealItem key={ind.slug}>
              <Link
                href={`/industries/${ind.slug}`}
                className="flip-card group block h-[380px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flip-card-inner h-full w-full">
                  {/* Front */}
                  <div className="flip-card-face flip-card-front h-full w-full overflow-hidden rounded-xl border border-border">
                    <div
                      className="relative flex h-full w-full flex-col justify-end bg-cover bg-center p-5"
                      style={{
                        backgroundImage: ind.image
                          ? `linear-gradient(180deg, transparent 42%, #2e3236d9 100%), url(${ind.image})`
                          : "linear-gradient(180deg, #f4f5f6 42%, #d8dbde 100%)",
                      }}
                    >
                      <span className="text-xs font-semibold tracking-widest text-[#b06f79]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="font-display mt-1 text-[17px] font-semibold text-white">{ind.name}</div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="flip-card-face flip-card-back flex h-full w-full flex-col rounded-xl border-t-[3px] border-accent bg-ink-800 px-6 py-7">
                    <span className="text-xs font-semibold tracking-widest text-[#b06f79]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="font-display mt-[22px] mb-3 text-[19px] font-semibold text-white">{ind.name}</div>
                    <p className="text-[14.5px] text-ink-muted">{ind.tagline}</p>
                    <span className="mt-auto text-[13.5px] font-bold text-white">Explore &rarr;</span>
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
