import { Eyebrow } from "@/components/ui/Eyebrow";
import { QueryCard } from "../../_components/QueryCard";
import { getQueries } from "../../_lib/queries";

export default async function QueriesPage() {
  const queries = await getQueries();

  return (
    <div className="container-page py-10">
      <Eyebrow>Queries</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            All Submissions
          </h1>
          <p className="mt-3 max-w-lg text-muted">
            Everything submitted through the site&rsquo;s contact and requirement forms, newest
            first.
          </p>
        </div>
        <span className="text-sm text-muted">
          {queries.length} {queries.length === 1 ? "submission" : "submissions"}
        </span>
      </div>

      {queries.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-background px-6 py-16 text-center">
          <p className="font-display text-lg font-bold">Nothing here yet.</p>
          <p className="mt-2 text-sm text-muted">
            When someone submits the contact or requirement form, it&rsquo;ll show up here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {queries.map((q) => (
            <QueryCard key={q.id} query={q} />
          ))}
        </div>
      )}
    </div>
  );
}
