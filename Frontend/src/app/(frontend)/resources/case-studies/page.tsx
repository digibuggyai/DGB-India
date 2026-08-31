import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real customer projects and infrastructure implementations.",
};

export default async function CaseStudiesPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Resources / Case Studies</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Case Studies</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="container-page">
          {caseStudies.length === 0 ? (
            <p className="text-muted">Nothing published yet — check back soon.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((cs) => (
                <Link
                  key={cs.id}
                  href={`/resources/case-studies/${cs.slug}`}
                  className="group flex flex-col rounded-lg border border-border p-6 transition-colors hover:border-accent/60 hover:bg-surface"
                >
                  <div className="font-medium text-foreground group-hover:text-accent-2">{cs.title}</div>
                  {cs.summary && <p className="mt-2 text-sm text-muted">{cs.summary}</p>}
                  {cs.results?.[0] && (
                    <div className="mt-4 border-t border-border pt-4 font-mono text-sm text-accent-2">
                      {cs.results[0].after} — {cs.results[0].metric}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
