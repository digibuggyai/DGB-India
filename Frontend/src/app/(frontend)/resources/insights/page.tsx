import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PostList } from "@/components/resources/PostList";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Insights",
  description: "Expert opinion and industry-specific infrastructure knowledge.",
};

export default async function InsightsPage() {
  const posts = await getPosts("insight");
  return (
    <>
      <section className="border-b border-border py-20">
        <div className="container-page">
          <Eyebrow>Resources / Insights</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Insights</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="container-page">
          <PostList posts={posts} basePath="/resources/insights" />
        </div>
      </section>
    </>
  );
}
