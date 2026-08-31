import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { getIndustries, getIndustryBySlug } from "@/lib/content";

export async function generateStaticParams() {
  const all = await getIndustries();
  return all.map((i) => ({ slug: i.slug ?? "" }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};
  return {
    title: industry.seo?.title || industry.name,
    description: industry.seo?.description || industry.tagline || undefined,
  };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const workloads = (industry.workloads ?? []).filter((w) => typeof w === "object");
  const applications = (industry.featuredApplications ?? []).filter((a) => typeof a === "object");
  const infra = (industry.recommendedInfrastructure ?? []).filter((i) => typeof i === "object");
  const caseStudies = (industry.caseStudies ?? []).filter((c) => typeof c === "object");
  const faqs = (industry.faqs ?? []).filter((f) => typeof f === "object");

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Industry</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {industry.name}
          </h1>
          {industry.tagline && <p className="mt-4 max-w-xl text-muted">{industry.tagline}</p>}
          <div className="mt-8">
            <ButtonLink href="/contact">Discuss Your Workload</ButtonLink>
          </div>
        </div>
      </section>

      {industry.heroCopy && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <RichText data={industry.heroCopy} />
          </div>
        </section>
      )}

      {(industry.challenges?.length ?? 0) > 0 && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Industry Challenges
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {industry.challenges!.map((c, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-6">
                  <div className="font-medium text-foreground">{c.title}</div>
                  {c.description && <p className="mt-2 text-sm text-muted">{c.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {workloads.length > 0 && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Typical Workloads
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {workloads.map((w) => (
                <div key={w.id} className="rounded-lg border border-border p-6">
                  <div className="font-medium text-foreground">{w.name}</div>
                  {w.description && <p className="mt-2 text-sm text-muted">{w.description}</p>}
                  {w.requirementProfile && (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-xs">
                      {w.requirementProfile.gpuIntensity && (
                        <>
                          <dt className="text-muted">GPU Intensity</dt>
                          <dd className="text-foreground/80 capitalize">{w.requirementProfile.gpuIntensity}</dd>
                        </>
                      )}
                      {w.requirementProfile.cpuIntensity && (
                        <>
                          <dt className="text-muted">CPU Intensity</dt>
                          <dd className="text-foreground/80 capitalize">{w.requirementProfile.cpuIntensity}</dd>
                        </>
                      )}
                      {w.requirementProfile.storageType && (
                        <>
                          <dt className="text-muted">Storage</dt>
                          <dd className="text-foreground/80 capitalize">{w.requirementProfile.storageType.replace(/-/g, " ")}</dd>
                        </>
                      )}
                      {w.requirementProfile.scalingPattern && (
                        <>
                          <dt className="text-muted">Scaling</dt>
                          <dd className="text-foreground/80 capitalize">{w.requirementProfile.scalingPattern.replace(/-/g, " ")}</dd>
                        </>
                      )}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {applications.length > 0 && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Applications &amp; Software
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {applications.map((a) => (
                <span key={a.id} className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/90">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {industry.requirementsNarrative && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Infrastructure Requirements
            </h2>
            <div className="mt-6">
              <RichText data={industry.requirementsNarrative} />
            </div>
          </div>
        </section>
      )}

      {infra.length > 0 && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Recommended Solutions
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infra.map((i) => (
                <Link
                  key={i.id}
                  href={`/infrastructure/${i.slug}`}
                  className="rounded-lg border border-border bg-background p-5 text-sm font-medium text-foreground hover:border-accent-2 hover:text-accent-2"
                >
                  {i.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {industry.possibleArchitecture?.description && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Possible Architecture
            </h2>
            <div className="mt-6">
              <RichText data={industry.possibleArchitecture.description} />
            </div>
          </div>
        </section>
      )}

      {caseStudies.length > 0 && (
        <section className="border-b border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">
              Case Studies
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {caseStudies.map((cs) => (
                <Link
                  key={cs.id}
                  href={`/resources/case-studies/${cs.slug}`}
                  className="rounded-lg border border-border bg-background p-6 hover:border-accent-2"
                >
                  <div className="font-medium text-foreground">{cs.title}</div>
                  {cs.summary && <p className="mt-2 text-sm text-muted">{cs.summary}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="border-b border-border py-16">
          <div className="container-page">
            <h2 className="font-mono text-sm uppercase tracking-widest text-accent-2">FAQ</h2>
            <div className="mt-6 space-y-6">
              {faqs.map((f) => (
                <div key={f.id}>
                  <div className="font-medium text-foreground">{f.question}</div>
                  <div className="mt-1">
                    <RichText data={f.answer} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Have a {industry.name.toLowerCase()} workload?
            </h2>
            <p className="mt-2 text-muted">Let&rsquo;s design the infrastructure around it.</p>
          </div>
          <ButtonLink href="/contact">Request a Consultation</ButtonLink>
        </div>
      </section>
    </>
  );
}
