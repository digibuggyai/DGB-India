import { ButtonLink } from "@/components/ui/Button";
import type { Infrastructure } from "@/payload-types";

const CARDS = [
  {
    title: "Business Applications",
    desc: "Reliable server infrastructure for the applications your business runs on every day.",
  },
  {
    title: "Virtualization",
    desc: "Servers sized and configured to run demanding virtualized environments smoothly.",
  },
  {
    title: "Databases",
    desc: "Performance and reliability configured for transactional and analytical database workloads.",
  },
  {
    title: "Enterprise Workloads",
    desc: "Infrastructure built for the scale and uptime enterprise operations require.",
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

export function ServersPage({ item }: { item: Infrastructure }) {
  const heroImageUrl = typeof item.heroImage === "object" && item.heroImage?.url ? item.heroImage.url : null;

  return (
    <>
      {/* Hero — centered */}
      <section
        className="border-b border-[#43484d] bg-[#202326] bg-cover bg-center py-32"
        style={
          heroImageUrl
            ? { backgroundImage: `linear-gradient(180deg, #202326d9 0%, #202326f7 100%), url(${heroImageUrl})` }
            : undefined
        }
      >
        <div className="container-page mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
            Infrastructure &middot; Servers
          </span>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            The Foundation Behind Your Operations.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[#cbd0d4]">
            Server infrastructure configured around how your business actually operates &mdash;
            not a generic rack of hardware.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/about#contact">Talk to an Expert &rarr;</ButtonLink>
          </div>
        </div>
      </section>

      {/* Built for Your Environment */}
      <section className="border-b border-[#e0e4e7] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ImagePanel url={heroImageUrl} className="h-[320px]" />
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight">Built for Your Environment.</h2>
            <p className="font-display mt-3 text-lg font-semibold text-accent">
              Every business runs differently.
            </p>
            <p className="mt-4 text-[#5c6166]">
              We configure server infrastructure around your applications, users and growth plans
              &mdash; so it fits how your business actually operates.
            </p>
          </div>
        </div>
      </section>

      {/* Where Servers Fit */}
      <section className="border-b border-[#e5e8ea] bg-[#f4f5f6] py-24">
        <div className="container-page">
          <h2 className="font-display text-[28px] font-bold">Where Servers Fit</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <div key={c.title} className="overflow-hidden rounded-lg border border-[#e0e4e7] bg-white">
                <ImagePanel url={heroImageUrl} className="h-[150px] rounded-none border-0" />
                <div className="p-5">
                  <div className="h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 text-lg font-bold">{c.title}</div>
                  <p className="mt-2 text-sm text-[#5c6166]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built to Keep Business Moving */}
      <section className="border-t border-[#d9bcc1] bg-[#ecdcdf] py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-[#2e3236]">
              Built to Keep Business Moving.
            </h2>
            <p className="mt-5 text-[#5c4448]">
              Downtime isn&rsquo;t an option for the systems your business depends on. We
              configure servers for reliability, not just raw performance.
            </p>
            <p className="mt-4 text-[#5c4448]">
              From a single application server to a fully virtualized environment, we size it to
              your operation.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Discuss Your Server Requirements &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} className="h-[320px] border-[#d9bcc1] bg-white/40" />
        </div>
      </section>
    </>
  );
}
