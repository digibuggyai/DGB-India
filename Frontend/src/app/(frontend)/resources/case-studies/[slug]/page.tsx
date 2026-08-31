import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const all = await getCaseStudies(100);
  return all.map((c) => ({ slug: c.slug ?? "" }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) return {};
  return {
    title: cs.seo?.title || cs.title,
    description: cs.seo?.description || cs.summary || undefined,
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs) notFound();

  const industry = typeof cs.industry === "object" ? cs.industry : null;
  const infra = (cs.infrastructureDeployed ?? []).filter((i) => typeof i === "object");
  const clientLabel = cs.clientAnonymous
    ? `A ${industry ? industry.name.toLowerCase() : ""} client`
    : cs.clientName;

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page max-w-3xl">
          <Eyebrow>Case Study{industry ? ` / ${industry.name}` : ""}</Eyebrow>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{cs.title}</h1>
          {clientLabel && <p className="mt-2 text-sm text-muted">{clientLabel}</p>}
          {cs.summary && <p className="mt-4 text-muted">{cs.summary}</p>}
        </div>
      </section>

      {(cs.results?.length ?? 0) > 0 && (
        <section className="border-b border-border bg-surface py-12">
          <div className="container-page max-w-3xl grid gap-6 sm:grid-cols-3">
            {cs.results!.map((r, i) => (
              <div key={i}>
                <div className="font-mono text-2xl text-accent-2">{r.after}</div>
                <div className="mt-1 text-xs text-muted">{r.metric}</div>
                {r.before && <div className="mt-1 text-xs text-muted/70">was {r.before}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-page max-w-3xl space-y-12">
          {cs.challenge && (
            <div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">Challenge</h2>
              <div className="mt-4">
                <RichText data={cs.challenge} />
              </div>
            </div>
          )}
          {cs.approach && (
            <div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">Approach</h2>
              <div className="mt-4">
                <RichText data={cs.approach} />
              </div>
            </div>
          )}
          {infra.length > 0 && (
            <div>
              <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
                Infrastructure Deployed
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {infra.map((i) => (
                  <Link
                    key={i.id}
                    href={`/infrastructure/${i.slug}`}
                    className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-accent-2 hover:text-accent-2"
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {cs.quote?.text && (
            <blockquote className="border-l-2 border-accent pl-6">
              <p className="text-lg text-foreground/90">&ldquo;{cs.quote.text}&rdquo;</p>
              {cs.quote.person && (
                <footer className="mt-3 text-sm text-muted">
                  {cs.quote.person}
                  {cs.quote.role ? `, ${cs.quote.role}` : ""}
                </footer>
              )}
            </blockquote>
          )}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Have a similar workload?</h2>
          <ButtonLink href="/contact">Talk to an Expert</ButtonLink>
        </div>
      </section>
    </>
  );
}
