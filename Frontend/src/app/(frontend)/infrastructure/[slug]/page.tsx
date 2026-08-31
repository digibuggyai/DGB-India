import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { getInfrastructure, getInfrastructureBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const all = await getInfrastructure();
  return all.map((i) => ({ slug: i.slug ?? "" }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getInfrastructureBySlug(slug);
  if (!item) return {};
  return {
    title: item.seo?.title || item.name,
    description: item.seo?.description || item.summary || undefined,
  };
}

export default async function InfrastructureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getInfrastructureBySlug(slug);
  if (!item) notFound();

  const parent = typeof item.parent === "object" ? item.parent : null;
  const suitedWorkloads = (item.suitedWorkloads ?? []).filter((w) => typeof w === "object");
  const relatedIndustries = (item.relatedIndustries ?? []).filter((i) => typeof i === "object");

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          {parent && (
            <Link href={`/infrastructure/${parent.slug}`} className="text-sm text-muted hover:text-accent-2">
              ← {parent.name}
            </Link>
          )}
          <Eyebrow>{CATEGORY_LABEL[item.category] ?? item.category}</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {item.name}
          </h1>
          {item.summary && <p className="mt-4 max-w-xl text-muted">{item.summary}</p>}
          <div className="mt-8">
            <ButtonLink href="/contact">Talk to an Expert</ButtonLink>
          </div>
        </div>
      </section>

      {item.overview && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <RichText data={item.overview} />
          </div>
        </section>
      )}

      {(item.useCases?.length ?? 0) > 0 && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="text-2xl font-semibold tracking-tight">Use Cases</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {item.useCases!.map((uc, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-6">
                  <div className="font-medium text-foreground">{uc.title}</div>
                  {uc.description && <p className="mt-2 text-sm text-muted">{uc.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {((item.capabilities?.length ?? 0) > 0 || (item.businessValue?.length ?? 0) > 0) && (
        <section className="border-b border-border py-16">
          <div className="container-page grid gap-12 md:grid-cols-2">
            {(item.capabilities?.length ?? 0) > 0 && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Capabilities</h2>
                <ul className="mt-4 space-y-2">
                  {item.capabilities!.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <span className="text-accent-2">—</span> {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(item.businessValue?.length ?? 0) > 0 && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Business Value</h2>
                <ul className="mt-4 space-y-2">
                  {item.businessValue!.map((v, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <span className="text-accent-2">—</span> {v.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {(suitedWorkloads.length > 0 || relatedIndustries.length > 0) && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page grid gap-12 md:grid-cols-2">
            {suitedWorkloads.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Suited Workloads</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suitedWorkloads.map((w) => (
                    <span key={w.id} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80">
                      {w.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {relatedIndustries.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Related Industries</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {relatedIndustries.map((ind) => (
                    <Link
                      key={ind.id}
                      href={`/industries/${ind.slug}`}
                      className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-accent-2 hover:text-accent-2"
                    >
                      {ind.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Need this sized for your workload?</h2>
            <p className="mt-2 text-muted">Tell us what you run — we&rsquo;ll recommend the right configuration.</p>
          </div>
          <ButtonLink href="/contact">Request a Consultation</ButtonLink>
        </div>
      </section>
    </>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  compute: "Compute",
  storage: "Storage",
  networking: "Networking",
  "data-protection": "Data Protection",
};
