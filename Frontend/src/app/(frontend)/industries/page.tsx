import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getIndustries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Infrastructure built around how each industry actually works — Architecture & Engineering, VFX & Animation, AI & Machine Learning, Trading & Finance, and Media & Production.",
};

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Industries</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            We speak your workload.
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Every industry stresses infrastructure differently. Find yours to see the workloads,
            applications and infrastructure we typically recommend.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {industries.map((ind) => (
            <Link
              key={ind.id}
              href={`/industries/${ind.slug}`}
              className="group rounded-lg border border-border p-8 transition-colors hover:border-accent/60 hover:bg-surface"
            >
              <div className="text-xl font-medium text-foreground group-hover:text-accent-2">
                {ind.name}
              </div>
              {ind.tagline && <p className="mt-2 text-muted">{ind.tagline}</p>}
              <span className="mt-6 inline-flex items-center gap-1 text-xs font-mono text-accent-2 opacity-0 transition-opacity group-hover:opacity-100">
                View industry →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
