import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getPosts, getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Blogs, case studies and insights on enterprise infrastructure and high-performance computing.",
};

export default async function ResourcesPage() {
  const [blogs, insights, caseStudies] = await Promise.all([
    getPosts("blog", 3),
    getPosts("insight", 3),
    getCaseStudies(3),
  ]);

  const sections = [
    { title: "Blogs", href: "/resources/blog", desc: "Educational and technical content.", count: blogs.length },
    { title: "Case Studies", href: "/resources/case-studies", desc: "Real customer projects and deployments.", count: caseStudies.length },
    { title: "Insights", href: "/resources/insights", desc: "Expert opinion and industry-specific knowledge.", count: insights.length },
  ];

  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Resources</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Infrastructure knowledge, not just hardware.
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-lg border border-border p-8 transition-colors hover:border-accent/60 hover:bg-surface"
            >
              <div className="text-xl font-medium text-foreground group-hover:text-accent-2">{s.title}</div>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
