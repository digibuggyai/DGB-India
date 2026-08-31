import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { getInfraNavTree } from "@/lib/nav-data";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "Compute, storage, networking and data-protection infrastructure, sized to your workload — servers, GPU servers, workstations, NAS and backup.",
};

export default async function InfrastructurePage() {
  const groups = await getInfraNavTree();

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Infrastructure</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            The infrastructure behind your work.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Every category below exists to serve a workload, not the other way around. Start from
            what you need to run, or browse by category.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page space-y-16">
          {groups.map((group) => (
            <div key={group.category}>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
                {group.label}
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/infrastructure/${item.slug}`}
                    className="group rounded-lg border border-border p-6 transition-colors hover:border-accent/60 hover:bg-surface"
                  >
                    <div className="font-medium text-foreground group-hover:text-accent-2">
                      {item.name}
                    </div>
                    {item.children.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {item.children.map((c) => (
                          <li key={c.id} className="text-sm text-muted">
                            {c.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Not sure what you need?</h2>
            <p className="mt-2 text-muted">Tell us about your workload — we&rsquo;ll recommend the infrastructure.</p>
          </div>
          <ButtonLink href="/contact">Talk to an Expert</ButtonLink>
        </div>
      </section>
    </>
  );
}
