import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getPosts } from "@/lib/content";
import { PostList } from "./PostList";

/* The Blog and Insights listing pages: one layout, two sections. */

const SECTIONS = {
  blog: {
    title: "Blog",
    intro: "Practical guides to specifying storage, compute and workstations — sizing, RAID, drives and the trade-offs that decide them.",
    basePath: "/resources/blog",
    other: { label: "Insights", href: "/resources/insights" },
  },
  insight: {
    title: "Insights",
    intro: "Opinion and analysis on where infrastructure is heading, and what it means for the teams that run it.",
    basePath: "/resources/insights",
    other: { label: "Blog", href: "/resources/blog" },
  },
} as const;

export async function PostIndex({ type }: { type: keyof typeof SECTIONS }) {
  const section = SECTIONS[type];
  // A CMS hiccup shows the empty state rather than an error page.
  const posts = await getPosts(type, 50).catch(() => []);

  return (
    <>
      <section className="border-b border-border bg-surface py-16 sm:py-20">
        <div className="container-page">
          <Eyebrow>Resources</Eyebrow>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{section.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{section.intro}</p>
            </div>
            <Link href={section.other.href} className="shrink-0 text-sm font-medium text-accent underline-offset-4 hover:underline">
              Read {section.other.label} →
            </Link>
          </div>
        </div>
      </section>
      <section className="py-14 sm:py-20">
        <div className="container-page">
          <PostList posts={posts} basePath={section.basePath} />
        </div>
      </section>
    </>
  );
}
