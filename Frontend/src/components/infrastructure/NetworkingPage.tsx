import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const ROWS = [
  {
    n: "01",
    title: "Workplace Connectivity",
    desc: "Reliable networking that keeps everyday devices and users connected without friction.",
  },
  {
    n: "02",
    title: "High-Performance Workflows",
    desc: "Low-latency, high-bandwidth networks for demanding creative and technical workloads.",
  },
  {
    n: "03",
    title: "Server & Storage Networks",
    desc: "Networking designed for fast, reliable access between servers, storage and clients.",
  },
  {
    n: "04",
    title: "Scalable Infrastructure",
    desc: "Networks built to expand alongside your team, sites and growing infrastructure.",
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

export function NetworkingPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero — centered, narrow */}
      <section
        className="border-b border-[#43484d] bg-[#202326] bg-cover bg-center py-32"
        style={
          heroImageUrl
            ? { backgroundImage: `linear-gradient(180deg, #202326d9 0%, #202326f7 100%), url(${heroImageUrl})` }
            : undefined
        }
      >
        <div className="container-page mx-auto max-w-[900px] text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
            Infrastructure &middot; Networking
          </span>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Connect Everything. Keep Work Moving.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#cbd0d4]">
            Networking infrastructure configured around your users, applications and traffic
            &mdash; not a generic switch layout.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
          </div>
        </div>
      </section>

      {/* Built Around Your Environment */}
      <section className="border-b border-[#e0e4e7] bg-white py-24">
        <div className="container-page">
          <ImagePanel url={heroImageUrl} className="h-[300px]" />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
            <h2 className="font-display text-[30px] font-bold tracking-tight">
              Built Around Your Environment.
            </h2>
            <div>
              <p className="font-display text-lg font-semibold text-accent">
                Every organization has different connectivity requirements.
              </p>
              <p className="mt-4 text-[#5c6166]">
                We design and configure networks around your actual traffic patterns, applications
                and growth &mdash; keeping performance reliable as your team scales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Where Networking Matters */}
      <section className="border-b border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="font-display text-[28px] font-bold text-[#2e3236]">
              Where Networking Matters
            </h2>
            <ImagePanel url={heroImageUrl} className="mt-6 h-[300px] border-[#d9bcc1] bg-white/40" />
          </div>
          <div className="space-y-6">
            {ROWS.map((r) => (
              <div key={r.n} className="flex gap-5 border-b border-[#d9bcc1] pb-6 last:border-0 last:pb-0">
                <div className="font-display shrink-0 text-2xl font-bold text-[#b06f79]">{r.n}</div>
                <div>
                  <div className="font-display text-lg font-bold text-[#2e3236]">{r.title}</div>
                  <p className="mt-1 text-sm text-[#5c4448]">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designed for How You Work */}
      <section className="border-t border-[#e0e4e7] bg-white py-24">
        <div className="container-page grid gap-12 overflow-hidden rounded-lg border border-[#e0e4e7] lg:grid-cols-2 lg:gap-0">
          <div className="p-10 sm:p-12">
            <h2 className="font-display text-[30px] font-bold tracking-tight">
              Designed for How You Work.
            </h2>
            <p className="mt-4 text-[#5c6166]">
              A well-designed network stays out of your way &mdash; fast, reliable and invisible
              until you need to scale it.
            </p>
            <p className="mt-4 text-[#5c6166]">
              We plan networking infrastructure around your current environment and where you&rsquo;re
              headed next.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Discuss Your Networking Requirements &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} className="min-h-[280px] rounded-none border-0" />
        </div>
      </section>
    </>
  );
}
