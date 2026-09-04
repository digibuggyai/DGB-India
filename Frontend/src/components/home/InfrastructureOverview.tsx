import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { InfraIcon } from "@/components/home/InfraIcon";
import { getInfrastructure } from "@/lib/content";

const TARGETS = [
  {
    match: ["dgx", "gpu"],
    name: "DGX",
    desc: "Built for high-performance computing and demanding workloads.",
    tags: ["GPU", "HPC", "Clusters"],
  },
  {
    match: ["workstation"],
    name: "Workstations",
    desc: "Powerful systems for design, visualization, rendering and professional workflows.",
    tags: ["Design", "Viz", "Rendering"],
  },
  {
    match: ["nas"],
    name: "NAS",
    desc: "High-performance shared storage for collaborative environments.",
    tags: ["Shared", "Collaborative", "Scale-out"],
  },
  {
    match: ["server"],
    name: "Servers",
    desc: "Reliable compute infrastructure built around your requirements.",
    tags: ["Rack", "Tower", "Blade"],
  },
  {
    match: ["storage"],
    name: "Storage",
    desc: "Scalable storage for data-intensive workloads.",
    tags: ["NAS", "SAN", "All-flash"],
  },
  {
    match: ["network"],
    name: "Networking",
    desc: "High-speed connectivity for demanding compute and data environments.",
    tags: ["Switching", "Fabric", "10/25/100G"],
  },
  {
    match: ["backup"],
    name: "Backup",
    desc: "Protection for critical data and workloads.",
    tags: ["Backup", "Replication", "Archive"],
  },
];

// Locally-saved real photography/renders that take priority over the
// generated InfraIcon fallback and over any CMS image is absent — key by
// the card's display name in TARGETS.
const STATIC_IMAGE: Record<string, string> = {
  DGX: "/dgx.png",
  Workstations: "/workstation.jpg",
  Servers: "/server.jpg",
  Storage: "/storage.jpg",
  Networking: "/networking.jpg",
};

export async function InfrastructureOverview() {
  const all = await getInfrastructure();

  const cards = TARGETS.map((t) => {
    const found = all.find((i) =>
      t.match.some((m) => i.name?.toLowerCase().includes(m) || i.slug?.toLowerCase().includes(m)),
    );
    const cmsImage =
      typeof found?.heroImage === "object" && found?.heroImage?.url ? found.heroImage.url : null;
    return {
      slug: found?.slug || t.name.toLowerCase(),
      name: t.name,
      desc: found?.summary || t.desc,
      tags: t.tags,
      image: cmsImage || STATIC_IMAGE[t.name] || null,
    };
  });

  const marqueeData = [...cards, ...cards];

  return (
    <section className="border-b border-border py-24">
      <div className="container-page">
        <Reveal>
          <Eyebrow>Popular Infrastructure</Eyebrow>
          <h2 className="font-display mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Popular with Our Customers
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Proven infrastructure solutions for demanding workloads.
          </p>
        </Reveal>
      </div>

      <div className="group/marquee mt-14 overflow-hidden py-8">
        <div className="dgb-marquee-track flex w-max gap-6 px-6 lg:px-10">
          {marqueeData.map((item, i) => (
            <div key={`${item.slug}-${i}`} className="group/card relative shrink-0" style={{ flex: "0 0 300px" }}>
              {/* base card */}
              <div className="h-full overflow-hidden rounded-lg border border-[#e0e4e7] bg-white transition-opacity group-hover/card:opacity-0">
                <div
                  className="h-[170px] bg-[#f3f4f5] bg-cover bg-center"
                  style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                >
                  {!item.image && <InfraIcon name={item.name} />}
                </div>
                <div className="p-6">
                  <div className="h-1 w-[34px] bg-accent" />
                  <div className="font-display mt-4 text-[22px] font-bold">{item.name}</div>
                  <p className="mt-2 text-[15px] text-[#5c6166]">{item.desc}</p>
                </div>
              </div>

              {/* expand-on-hover panel */}
              <div
                className="pointer-events-none absolute left-1/2 z-20 w-[144%] -translate-x-1/2 scale-90 rounded-lg border border-ink-800 bg-white opacity-0 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.35)] transition-all duration-[280ms] group-hover/card:pointer-events-auto group-hover/card:scale-100 group-hover/card:opacity-100"
                style={{ top: "-28px" }}
              >
                <div className="relative">
                  <div
                    className="h-[210px] rounded-t-lg bg-[#f3f4f5] bg-cover bg-center"
                    style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                  >
                    {!item.image && <InfraIcon name={item.name} size={104} />}
                  </div>
                  <span className="absolute left-3 top-3 rounded bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    DGB
                  </span>
                </div>
                <div className="p-6">
                  <div className="font-display text-2xl font-bold">{item.name}</div>
                  <p className="mt-2 text-[15px] text-[#5c6166]">{item.desc}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/infrastructure/${item.slug}`}
                      className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
                    >
                      Explore &rarr;
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                    >
                      Talk to an Expert
                    </Link>
                  </div>
                  <div className="mt-5 border-t border-border pt-4 text-xs text-[#5c6166]">
                    {item.tags.join(" · ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page">
        <Link
          href="/infrastructure"
          className="inline-block border-b border-accent text-sm font-bold text-accent"
        >
          View All Infrastructure &rarr;
        </Link>
      </div>
    </section>
  );
}
