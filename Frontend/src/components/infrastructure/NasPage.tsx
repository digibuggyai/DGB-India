import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const CARDS = [
  { title: "Media & Production", desc: "Centralized, high-throughput storage for editing and production teams." },
  { title: "Architecture & Engineering", desc: "Shared project storage for CAD, BIM and modelling files." },
  { title: "VFX & Animation", desc: "Fast shared access for rendering pipelines and large asset libraries." },
  { title: "Business Data", desc: "Reliable, centralized storage for day-to-day business files and records." },
];

function ImagePanel({ url, className = "" }: { url: string | null; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-[#e0e4e7] bg-[#eef1f3] bg-cover bg-center ${className}`}
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    />
  );
}

export function NasPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#e0e4e7] bg-white py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Infrastructure &middot; NAS
            </span>
            <h1 className="font-display mt-4 max-w-xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-[56px]">
              Your Data, Where Your Team Needs It.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[#5c6166]">
              Centralized network storage configured around how your team shares, accesses and
              works with files &mdash; from anywhere on your network.
            </p>
            <div className="mt-8">
              <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} className="h-[360px]" />
        </div>
      </section>

      {/* One Place for Your Projects */}
      <section className="bg-[#202326] py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.42fr_1fr] lg:items-center lg:gap-16">
          <ImagePanel url={heroImageUrl} className="h-[260px] border-[#43484d] bg-[#2e3236]" />
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-white">
              One Place for Your Projects.
            </h2>
            <p className="font-display mt-3 text-lg font-semibold text-[#b06f79]">
              Scattered files and disconnected storage can make collaboration difficult.
            </p>
            <p className="mt-4 max-w-xl text-[#a9b0b6]">
              NAS brings your projects, media and business files into one centralized, accessible
              location &mdash; so your team is always working from the same source.
            </p>
          </div>
        </div>
      </section>

      {/* Where NAS Makes a Difference */}
      <section className="bg-white py-24">
        <div className="container-page">
          <h2 className="font-display text-[28px] font-bold">Where NAS Makes a Difference</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <div
                key={c.title}
                className="relative h-[280px] overflow-hidden rounded-lg border border-[#e0e4e7] bg-cover bg-center"
                style={heroImageUrl ? { backgroundImage: `url(${heroImageUrl})` } : { backgroundColor: "#eef1f3" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 40%, #202326e6 100%)" }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 text-lg font-bold text-white">{c.title}</div>
                  <p className="mt-1 text-sm text-[#cbd0d4]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage That Grows With Your Work */}
      <section className="border-t border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page grid gap-12 overflow-hidden rounded-lg border border-[#d9bcc1] lg:grid-cols-2 lg:gap-0">
          <ImagePanel url={heroImageUrl} className="min-h-[320px] rounded-none border-0" />
          <div className="bg-white p-10 sm:p-12">
            <h2 className="font-display text-[28px] font-bold tracking-tight">
              Storage That Grows With Your Work.
            </h2>
            <p className="mt-4 text-[#5c6166]">
              As your projects and teams grow, your storage needs to keep pace. NAS solutions from
              DGB India are configured to scale with you.
            </p>
            <p className="mt-4 text-[#5c6166]">
              We size capacity, performance and redundancy around your actual project volumes and
              growth plans.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Plan Your Storage &rarr;</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
