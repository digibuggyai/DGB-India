import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const WORK_CARDS = [
  {
    n: "01",
    title: "Workstation-Class DGS",
    desc: "Configured for professionals running CAD, modelling, visualization and design applications directly at the desk.",
  },
  {
    n: "02",
    title: "Compute-Focused DGS",
    desc: "Built around sustained CPU and multi-threaded performance for simulation, analysis and data-heavy workloads.",
  },
  {
    n: "03",
    title: "GPU-Accelerated DGS",
    desc: "Configured with the GPU horsepower needed for rendering, AI training and real-time visualization work.",
  },
  {
    n: "04",
    title: "Custom DGS Solutions",
    desc: "Tailored configurations for teams whose workflow doesn&rsquo;t fit a standard category or off-the-shelf system.",
  },
];

function ImagePanel({ url, className = "" }: { url: string | null; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[#e0e4e7] bg-[#eef1f3] bg-cover bg-center ${className}`}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    />
  );
}

export function DgxPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-[#202326] bg-cover bg-center py-28 sm:py-36"
        style={{
          backgroundImage: heroImageUrl
            ? `linear-gradient(180deg, #202326d9 0%, #202326b3 40%, #202326f7 100%), url(${heroImageUrl})`
            : undefined,
        }}
      >
        <div className="container-page relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
              Infrastructure &middot; DGX
            </span>
            <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[60px]">
              Built Around the Workload.
            </h1>
          </div>
          <div className="border-l-2 border-accent pl-6">
            <p className="text-[17px] text-[#cbd0d4]">
              DGS systems are designed for demanding professional and computational workloads
              configured around how your team actually works.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* More Than a Standard System */}
      <section className="border-b border-[#e0e4e7] py-24">
        <div className="container-page grid gap-12 overflow-hidden rounded-lg border border-[#e0e4e7] lg:grid-cols-2 lg:gap-0">
          <ImagePanel url={heroImageUrl} className="min-h-[320px] rounded-none border-0" />
          <div className="bg-white p-10 sm:p-12">
            <h2 className="font-display text-[32px] font-bold tracking-tight">
              More Than a Standard System.
            </h2>
            <p className="font-display mt-3 text-lg font-semibold text-accent">
              Every workload has different requirements.
            </p>
            <p className="mt-4 text-[#5c6166]">
              DGB India works around your applications, performance needs and workflow to design a
              DGS configuration that fits your work rather than forcing your work into a standard
              configuration.
            </p>
          </div>
        </div>
      </section>

      {/* Our Work Around DGS */}
      <section className="bg-[#202326] py-24">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <h2 className="font-display max-w-sm text-[32px] font-bold tracking-tight text-white">
              Our Work Around DGS
            </h2>
            <p className="max-w-xl text-lg text-[#a9b0b6]">
              DGS solutions are designed around demanding environments across architecture,
              engineering, VFX, AI, media and other performance-intensive workflows.
            </p>
          </div>
          <ImagePanel url={heroImageUrl} className="mt-12 h-[320px] rounded-lg border-[#43484d] bg-[#2e3236]" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORK_CARDS.map((c) => (
              <div key={c.n} className="rounded-lg border border-[#43484d] bg-[#2e3236] p-6">
                <div className="font-display text-sm font-semibold text-[#8a9095]">{c.n}</div>
                <div className="mt-3 h-0.5 w-8 bg-accent" />
                <div className="font-display mt-3 text-lg font-bold text-white">{c.title}</div>
                <p className="mt-2 text-sm text-[#a9b0b6]" dangerouslySetInnerHTML={{ __html: c.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Requirement to Ready-to-Work */}
      <section className="border-t border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ImagePanel url={heroImageUrl} className="h-[320px] border-[#d9bcc1] bg-white/40" />
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-[#2e3236]">
              From Requirement to Ready-to-Work.
            </h2>
            <p className="font-display mt-3 text-lg font-semibold text-accent">
              We don&rsquo;t start with a fixed configuration. We start with the work.
            </p>
            <p className="mt-4 text-[#5c4448]">
              We take the time to understand your applications, performance needs and workflow
              before configuring a DGS system built specifically around it.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Tell Us What You Need &rarr;</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
