import { ButtonLink } from "@/components/ui/Button";
import { infrastructureFit, infrastructureImage } from "@/lib/site-images";
import type { Infrastructure } from "@/payload-types";

const ROWS = [
  {
    n: "01",
    title: "Project Data",
    desc: "Active project files organized and accessible where your team is actually working.",
  },
  {
    n: "02",
    title: "Media & Creative Assets",
    desc: "High-throughput storage sized for large media libraries and creative workflows.",
  },
  {
    n: "03",
    title: "Business Applications",
    desc: "Reliable storage backing the applications your day-to-day operations depend on.",
  },
  {
    n: "04",
    title: "High-Performance Workloads",
    desc: "Fast, low-latency storage configured for the most demanding compute-heavy workloads.",
  },
];

function ImagePanel({
  url,
  fit = "cover",
  className = "",
}: {
  url: string | null;
  fit?: "cover" | "contain";
  className?: string;
}) {
  const surface = fit === "contain" ? "bg-white" : "bg-[#eef1f3]";
  return (
    <div
      className={`rounded-lg border border-[#e0e4e7] ${surface} bg-center bg-no-repeat ${className}`}
      style={url ? { backgroundImage: `url("${url}")`, backgroundSize: fit } : undefined}
    />
  );
}

export function StoragePage({ item }: { item: Infrastructure }) {
  const heroImageUrl = infrastructureImage(item);
  const heroFit = infrastructureFit(item);

  return (
    <>
      <section className="border-b border-[#d9bcc1] bg-[#ecdcdf] py-12 sm:py-24">
        <div className="container-page grid gap-8 sm:gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <ImagePanel url={heroImageUrl} fit={heroFit} className="h-[220px] border-[#d9bcc1] bg-white/40 sm:h-[280px] lg:h-[340px]" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b06f79]">
              Infrastructure &middot; Storage
            </span>
            <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-[#2e3236] sm:text-5xl lg:text-[54px]">
              Storage for the Data You Depend On.
            </h1>
            <p className="mt-5 max-w-lg text-base text-[#5c4448] sm:text-lg">
              Storage infrastructure configured around your data types, growth rate and
              performance needs &mdash; not a fixed capacity figure.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e0e4e7] py-12 sm:py-24">
        <div className="container-page mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[32px]">More Than Just Capacity.</h2>
          <p className="mt-5 text-[#5c6166]">
            Storage isn&rsquo;t just about how much you can hold &mdash; it&rsquo;s about how fast
            you can access it, how reliably it&rsquo;s protected, and how well it fits your
            workflow.
          </p>
          <p className="mt-4 text-[#5c6166]">
            We configure storage around the actual demands of your data, not just a number on a
            spec sheet.
          </p>
        </div>
      </section>

      <section className="bg-[#202326] py-12 sm:py-24">
        <div className="container-page">
          <h2 className="font-display text-2xl font-bold text-white sm:text-[28px]">Where Storage Matters</h2>
          <div className="mt-8 space-y-10 sm:mt-12 sm:space-y-16">
            {ROWS.map((r, i) => (
              <div
                key={r.n}
                className={`grid gap-6 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ImagePanel url={heroImageUrl} fit={heroFit} className="h-[200px] border-[#43484d] bg-[#2e3236] sm:h-[220px] lg:h-[260px]" />
                <div>
                  <div className="font-display text-2xl font-bold text-[#8a9095]">{r.n}</div>
                  <div className="mt-3 h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 text-2xl font-bold text-white">{r.title}</div>
                  <p className="mt-3 max-w-md text-[#a9b0b6]">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e0e4e7] bg-white py-12 sm:py-24">
        <div className="container-page grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[30px]">
              Plan for the Data You Have. Prepare for the Data You&rsquo;ll Create.
            </h2>
            <p className="font-display mt-3 text-lg font-semibold text-accent">
              Storage requirements rarely stay the same.
            </p>
            <p className="mt-4 text-[#5c6166]">
              We design storage that can grow with your projects, your team and your data &mdash;
              so you&rsquo;re not re-architecting every time you scale.
            </p>
            <div className="mt-6">
              <ButtonLink href="/about#contact">Discuss Your Storage Requirements &rarr;</ButtonLink>
            </div>
          </div>
          <ImagePanel url={heroImageUrl} fit={heroFit} className="h-[200px] sm:h-[260px] lg:h-[320px]" />
        </div>
      </section>
    </>
  );
}
