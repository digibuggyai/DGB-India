import { StatusBadge } from "./StatusBadge";
import { formatDate, relName, type Query } from "../_lib/queries";

export function QueryCard({ query: q }: { query: Query }) {
  const industry = relName(q.industry ?? null);
  const infrastructure = (q.interestedInfrastructure ?? [])
    .map(relName)
    .filter((n): n is string => Boolean(n));

  const meta: { label: string; value: string }[] = [];
  if (industry) meta.push({ label: "Industry", value: industry });
  if (infrastructure.length) meta.push({ label: "Interested in", value: infrastructure.join(", ") });
  if (q.companySize) meta.push({ label: "Company size", value: q.companySize });
  if (q.applicationsUsed) meta.push({ label: "Applications", value: q.applicationsUsed });

  const origin = q.source?.utmSource || q.source?.sourceUrl || q.source?.referrer;

  return (
    <article className="rounded-lg border border-border bg-background p-5 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(16,21,28,0.3)] sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight">{q.company}</h3>
          <p className="mt-0.5 text-sm text-muted">{q.name}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge status={q.status} />
          <time className="text-xs text-muted">{formatDate(q.createdAt)}</time>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <a href={`mailto:${q.email}`} className="text-foreground/80 hover:text-accent">
          {q.email}
        </a>
        {q.phone && (
          <a href={`tel:${q.phone.replace(/\s+/g, "")}`} className="text-foreground/80 hover:text-accent">
            {q.phone}
          </a>
        )}
      </div>

      {meta.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-border pt-4 sm:grid-cols-2">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                {m.label}
              </dt>
              <dd className="mt-0.5 text-sm text-foreground/90">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {q.workloadDescription && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Requirement
          </div>
          <p className="mt-1.5 whitespace-pre-wrap border-l-2 border-accent pl-4 text-sm text-foreground">
            {q.workloadDescription}
          </p>
        </div>
      )}

      {q.message && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Additional details
          </div>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">{q.message}</p>
        </div>
      )}

      {origin && (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
          Came from: <span className="break-all text-foreground/70">{origin}</span>
        </p>
      )}
    </article>
  );
}
