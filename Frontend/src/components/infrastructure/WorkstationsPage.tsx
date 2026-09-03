import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const CARDS = [
  {
    title: "Architecture & Engineering",
    desc: "Workstations configured for CAD, BIM and modelling applications that demand precision and speed.",
  },
  {
    title: "VFX & Animation",
    desc: "GPU-ready systems built for demanding rendering, compositing and animation pipelines.",
  },
  {
    title: "Media & Production",
    desc: "Reliable performance for editing, color grading and high-resolution media workflows.",
  },
  {
    title: "Professional Design",
    desc: "Configured for design and visualization tools that need consistent, dependable output.",
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

export function WorkstationsPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
            Infrastructure &middot; Workstations
          </span>
          <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-[#2e3236] sm:text-5xl lg:text-[58px]">
            Your Work Deserves a Better Workstation.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#5c4448]">
            Workstations configured around your applications, not a generic spec sheet &mdash; so
            performance matches how you actually work.
          </p>
          <div className="mt-8">
            <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
          </div>
          <ImagePanel url={heroImageUrl} className="mt-14 h-[360px] border-white/40" />
        </div>
      </section>

      {/* Built for the Applications You Use */}
      <section className="border-b border-[#e0e4e7] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight">
              Built for the Applications You Use.
            </h2>
            <p className="mt-5 text-[#5c6166]">
              Every workstation is configured around the software your team runs every day &mdash;
              from CAD and modelling tools to rendering and creative applications.
            </p>
            <p className="mt-4 text-[#5c6166]">
              Rather than starting from a fixed spec, we start with your workflow and build a
              system that keeps pace with it.
            </p>
          </div>
          <ImagePanel url={heroImageUrl} className="h-[320px]" />
        </div>
      </section>

      {/* Where Our Workstations Make a Difference */}
      <section className="bg-[#202326] py-24">
        <div className="container-page">
          <h2 className="font-display text-[28px] font-bold text-white">
            Where Our Workstations Make a Difference
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <div key={c.title} className="overflow-hidden rounded-lg border border-[#43484d] bg-[#2e3236]">
                <ImagePanel url={heroImageUrl} className="h-[150px] rounded-none border-0 bg-[#3a3f44]" />
                <div className="p-5">
                  <div className="h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 text-lg font-bold text-white">{c.title}</div>
                  <p className="mt-2 text-sm text-[#a9b0b6]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Desk to Delivery */}
      <section className="border-t border-[#e0e4e7] py-24">
        <div className="container-page grid gap-12 overflow-hidden rounded-lg border border-[#e0e4e7] lg:grid-cols-2 lg:gap-0">
          <ImagePanel url={heroImageUrl} className="min-h-[320px] rounded-none border-0" />
          <div className="bg-white p-10 sm:p-12">
            <h2 className="font-display text-[32px] font-bold tracking-tight">From Desk to Delivery.</h2>
            <p className="font-display mt-3 text-lg font-semibold text-accent">
              A workstation built around your applications, not a generic spec sheet.
            </p>
            <p className="mt-4 text-[#5c6166]">
              Tell us what you run and how you work &mdash; we&rsquo;ll configure a workstation that
              keeps up.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Find Your Workstation &rarr;</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
