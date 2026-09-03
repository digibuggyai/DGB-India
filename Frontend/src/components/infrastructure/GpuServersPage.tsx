import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const ROWS = [
  {
    n: "01",
    title: "AI & Machine Learning",
    desc: "GPU servers configured for model training, inference and data-intensive AI pipelines.",
  },
  {
    n: "02",
    title: "Rendering",
    desc: "Accelerated rendering performance for VFX, animation and visualization workloads.",
  },
  {
    n: "03",
    title: "Simulation",
    desc: "Sustained GPU throughput for engineering, scientific and computational simulation.",
  },
  {
    n: "04",
    title: "Data Processing",
    desc: "High-throughput GPU compute for large-scale data processing and analytics workloads.",
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

export function GpuServersPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section
        className="border-b border-[#43484d] bg-[#202326] bg-cover bg-center py-28"
        style={
          heroImageUrl
            ? { backgroundImage: `linear-gradient(90deg, #202326f2 0%, #202326cc 55%, #20232655 100%), url(${heroImageUrl})` }
            : undefined
        }
      >
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
              Infrastructure &middot; GPU Servers
            </span>
            <h1 className="font-display mt-4 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[58px]">
              Accelerate What Matters.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[#cbd0d4]">
              GPU-accelerated servers configured around the workloads that need the most compute
              &mdash; from AI to rendering to simulation.
            </p>
            <div className="mt-8">
              <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} className="h-[320px] border-[#43484d] bg-[#2e3236]" />
        </div>
      </section>

      {/* Built for Heavy Workloads */}
      <section className="border-b border-[#e0e4e7] py-24">
        <div className="container-page">
          <ImagePanel url={heroImageUrl} className="h-[300px]" />
          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <h2 className="font-display max-w-sm text-[32px] font-bold tracking-tight">
              Built for Heavy Workloads.
            </h2>
            <div className="border-l-2 border-accent pl-6">
              <p className="text-[#5c6166]">
                GPU requirements vary widely depending on the workload &mdash; from training and
                inference to rendering and simulation.
              </p>
              <p className="mt-4 text-[#5c6166]">
                We configure GPU servers around the specific compute profile your applications
                need, rather than a one-size-fits-all specification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where GPU Servers Make a Difference */}
      <section className="border-b border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page">
          <h2 className="font-display text-[28px] font-bold text-[#2e3236]">
            Where GPU Servers Make a Difference
          </h2>
          <div className="mt-10 space-y-5">
            {ROWS.map((r) => (
              <div
                key={r.n}
                className="grid gap-6 rounded-lg border border-[#d9bcc1] bg-white/60 p-6 sm:grid-cols-[120px_60px_1fr] sm:items-center"
              >
                <ImagePanel url={heroImageUrl} className="h-[90px] border-white bg-white" />
                <div className="font-display text-2xl font-bold text-[#b06f79]">{r.n}</div>
                <div>
                  <div className="font-display text-lg font-bold text-[#2e3236]">{r.title}</div>
                  <p className="mt-1 text-sm text-[#5c4448]">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Right GPU for the Right Work */}
      <section className="bg-[#202326] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-white">
              The Right GPU for the Right Work.
            </h2>
            <p className="mt-5 text-[#a9b0b6]">
              Not every workload needs the same GPU. We size configurations around your actual
              compute requirements, so you&rsquo;re not overpaying or underpowered.
            </p>
            <p className="mt-4 text-[#a9b0b6]">
              From single-GPU workstations to multi-GPU server clusters, we build what your work
              actually calls for.
            </p>
            <div className="mt-8">
              <ButtonLink href="/about#contact">Discuss Your GPU Workload &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} className="h-[320px] border-[#43484d] bg-[#2e3236]" />
        </div>
      </section>
    </>
  );
}
