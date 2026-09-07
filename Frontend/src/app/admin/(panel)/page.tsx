import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { QueryCard } from "../_components/QueryCard";
import { getQueries } from "../_lib/queries";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function OverviewPage() {
  const queries = await getQueries();

  const now = Date.now();
  const stats = [
    { label: "Total queries", value: queries.length },
    { label: "New / unactioned", value: queries.filter((q) => q.status === "new").length },
    {
      label: "Last 7 days",
      value: queries.filter((q) => now - new Date(q.createdAt).getTime() < WEEK_MS).length,
    },
  ];

  const recent = queries.slice(0, 3);

  return (
    <div className="container-page py-10">
      <Eyebrow>Overview</Eyebrow>
      <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-3 max-w-lg text-muted">
        A snapshot of what&rsquo;s come in through the site, and quick access to your content.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background p-6">
            <div className="h-1 w-[30px] bg-accent" />
            <div className="font-display mt-4 text-4xl font-bold tracking-tight">{s.value}</div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight">Recent Queries</h2>
        {queries.length > recent.length && (
          <Link href="/admin/queries" className="text-sm font-medium text-accent hover:underline">
            View all {queries.length} &rarr;
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted">
          No queries yet. Submissions from the site&rsquo;s forms will appear here.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {recent.map((q) => (
            <QueryCard key={q.id} query={q} />
          ))}
        </div>
      )}
    </div>
  );
}
