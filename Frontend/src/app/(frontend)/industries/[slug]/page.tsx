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
  const challenges = industry.challenges ?? [];
  const applications = (industry.featuredApplications ?? []).filter((a) => typeof a === "object");
  const infra = (industry.recommendedInfrastructure ?? []).filter((i) => typeof i === "object");
  const caseStudies = (industry.caseStudies ?? []).filter((c) => typeof c === "object");
  const faqs = (industry.faqs ?? []).filter((f) => typeof f === "object");
  const heroImageUrl =
    typeof industry.heroImage === "object" && industry.heroImage?.url ? industry.heroImage.url : null;

  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-ink-800 bg-cover bg-center py-24 sm:py-32"
        style={{
          backgroundImage: heroImageUrl
            ? `linear-gradient(to top, rgba(32,35,38,0.95), rgba(32,35,38,0.65)), url(${heroImageUrl})`
            : undefined,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, #43484d 1px, transparent 1px), linear-gradient(to bottom, #43484d 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container-page relative">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            <span className="h-px w-6 bg-accent" />
            Industry
          </span>
          <h1 className="font-display mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {industry.name}
          </h1>
          {industry.tagline && (
            <p className="mt-5 max-w-xl text-lg text-ink-muted-2">{industry.tagline}</p>
          )}
          <div className="mt-9">
            <ButtonLink href="/contact">Discuss Your Workload</ButtonLink>
          </div>
        </div>
      </section>

      {/* Intro / concept narrative */}
      {industry.heroCopy && (
        <section className="border-b border-border py-20">
          <div className="container-page grid gap-10 lg:grid-cols-2">
            <h2 className="font-display max-w-sm text-2xl font-semibold tracking-tight sm:text-3xl">
              From Concept to Completion
            </h2>
            <div className="max-w-xl">
              <RichText data={industry.heroCopy} />
            </div>
          </div>
        </section>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <section className="border-b border-border bg-surface py-20">
          <div className="container-page">
            <Eyebrow>Industry Challenges</Eyebrow>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((c, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_40px_-20px_rgba(128,32,44,0.35)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-raised text-xs font-semibold text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-4 h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 font-medium text-foreground">{c.title}</div>
                  {c.description && <p className="mt-2 text-sm text-muted">{c.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workloads */}
      {workloads.length > 0 && (
        <section className="border-b border-border py-20">
          <div className="container-page">
            <Eyebrow>Typical Workloads</Eyebrow>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workloads.map((w) => (
                <div
                  key={w.id}
                  className="group rounded-xl border border-border p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_40px_-20px_rgba(128,32,44,0.35)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface text-muted">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 9h18M8 4v5" />
                    </svg>
                  </div>
                  <div className="mt-4 h-0.5 w-8 bg-accent" />
                  <div className="font-display mt-3 font-medium text-foreground">{w.name}</div>
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

      {/* Applications */}
      {applications.length > 0 && (
        <section className="border-b border-border bg-surface py-20">
          <div className="container-page">
            <Eyebrow>Built for Your Applications</Eyebrow>
            <div className="mt-8 flex flex-wrap gap-3">
              {applications.map((a) => (
                <span
                  key={a.id}
                  className="rounded-full border border-tint-border bg-tint px-4 py-2 text-sm font-medium text-tint-foreground"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirements + architecture — blush 2-col */}
      {(industry.requirementsNarrative || industry.possibleArchitecture?.description) && (
        <section className="border-b border-tint-border bg-tint py-20">
          <div className="container-page grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display max-w-sm text-2xl font-semibold tracking-tight text-tint-foreground sm:text-3xl">
                Engineered for Performance
              </h2>
              {industry.requirementsNarrative && (
                <div className="mt-6 max-w-xl text-tint-muted">
                  <RichText data={industry.requirementsNarrative} />
                </div>
              )}
            </div>
            {industry.possibleArchitecture?.description && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Possible Architecture
                </span>
                <div className="mt-4 max-w-xl text-tint-muted">
                  <RichText data={industry.possibleArchitecture.description} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recommended infrastructure */}
      {infra.length > 0 && (
        <section className="border-b border-border py-20">
          <div className="container-page">
            <Eyebrow>Recommended Solutions</Eyebrow>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infra.map((i) => (
                <Link
                  key={i.id}
                  href={`/infrastructure/${i.slug}`}
                  className="rounded-lg border border-border bg-background p-5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {i.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Case studies */}
      {caseStudies.length > 0 && (
        <section className="border-b border-border bg-surface py-20">
          <div className="container-page">
            <Eyebrow>Case Studies</Eyebrow>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {caseStudies.map((cs) => (
                <Link
                  key={cs.id}
                  href={`/resources/case-studies/${cs.slug}`}
                  className="rounded-xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-[0_18px_40px_-20px_rgba(128,32,44,0.35)]"
                >
                  <div className="font-display font-medium text-foreground">{cs.title}</div>
                  {cs.summary && <p className="mt-2 text-sm text-muted">{cs.summary}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="border-b border-border py-20">
          <div className="container-page max-w-3xl">
            <Eyebrow>FAQ</Eyebrow>
            <div className="mt-8 divide-y divide-border">
              {faqs.map((f) => (
                <details key={f.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                    {f.question}
                    <span className="ml-4 shrink-0 text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-3 text-muted">
                    <RichText data={f.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="flex flex-col items-start gap-8 rounded-2xl bg-accent px-8 py-14 sm:px-14 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Have a {industry.name} workload?
              </h2>
              <p className="mt-2 max-w-md text-white/80">Let&rsquo;s design the infrastructure around it.</p>
            </div>
            <ButtonLink
              href="/contact"
              className="shrink-0 !bg-ink-800 !text-white hover:!bg-ink-900"
            >
              Request a Consultation
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
