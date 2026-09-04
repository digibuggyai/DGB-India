import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SolutionRequestForm } from "@/components/forms/SolutionRequestForm";

export const metadata: Metadata = {
  title: "Request a Solution",
  description:
    "Tell us what you're building and what it needs — we'll come back with the right infrastructure for your workload.",
};

export default async function RequestSolutionPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;

  return (
    <section className="py-20">
      <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Eyebrow>Request a Solution</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Tell Us What You&rsquo;re Building.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Organization, contact details and what you need — that&rsquo;s it. We&rsquo;ll review
            your requirement and get back to you with the right infrastructure for the workload.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8">
          <SolutionRequestForm source={source} />
        </div>
      </div>
    </section>
  );
}
