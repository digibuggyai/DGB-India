import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";
import { getInfraIcon } from "@/lib/icons";
import { getInfraNavTree } from "@/lib/nav-data";

const FALLBACK = [
  {
    label: "Compute",
    category: "compute",
    items: [
      { id: "servers", name: "Servers", slug: "servers", children: [] },
      { id: "gpu-servers", name: "GPU Servers", slug: "gpu-servers", children: [] },
      { id: "workstations", name: "Workstations", slug: "workstations", children: [] },
    ],
  },
  {
    label: "Storage",
    category: "storage",
    items: [
      { id: "storage", name: "Storage Systems", slug: "storage", children: [] },
      { id: "nas", name: "NAS", slug: "nas", children: [] },
    ],
  },
  {
    label: "Networking",
    category: "networking",
    items: [{ id: "networking", name: "Networking", slug: "networking", children: [] }],
  },
  {
    label: "Data Protection",
    category: "data-protection",
    items: [{ id: "backup", name: "Backup", slug: "backup", children: [] }],
  },
];

export async function InfrastructureOverview() {
  const groups = await getInfraNavTree();
  const data = groups.length ? groups : FALLBACK;

  const marqueeData = [...data, ...data];

  return (
    <section className="border-b border-border bg-surface py-24">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Popular Infrastructure</Eyebrow>
              <h2 className="font-display mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                The infrastructure behind your work.
              </h2>
            </div>
            <ButtonLink href="/infrastructure" variant="secondary">
              Explore Infrastructure
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <div className="group/marquee mt-12 overflow-hidden">
        <div className="animate-marquee flex w-max gap-4 px-6 lg:px-10">
          {marqueeData.map((group, gi) => {
            // Flatten to the leaf nodes people actually click: children if
            // present, otherwise the item itself (e.g. Networking has none).
            const leaves = group.items.flatMap((item) =>
              item.children.length > 0 ? item.children : [item],
            );
            const GroupIcon = getInfraIcon(group.category);

            return (
              <SpotlightCard
                key={`${group.category}-${gi}`}
                className="card-depth w-72 shrink-0 rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tint text-accent">
                  <GroupIcon size={18} strokeWidth={1.75} />
                </span>
                <div className="font-display mt-4 text-base font-medium text-foreground">
                  {group.label}
                </div>
                <ul className="mt-4 space-y-2.5 border-t border-border pt-4">
                  {leaves.map((item) => {
                    const ItemIcon = getInfraIcon(item.slug);
                    return (
                      <li key={item.id}>
                        <Link
                          href={`/infrastructure/${item.slug}`}
                          className="flex items-center gap-2 text-sm text-foreground/80 hover:text-accent"
                        >
                          <ItemIcon size={14} strokeWidth={1.75} className="shrink-0 text-muted" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
