import { redirect } from "next/navigation";
import { getAdminUser, getAdminToken } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Relationship fields come back populated (depth=1) as objects, or as a bare
// id if the related doc was removed.
type Rel = { id: number | string; name?: string | null } | number | string | null;

type Query = {
  id: number | string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  industry?: Rel;
  interestedInfrastructure?: Rel[] | null;
  workloadDescription?: string | null;
  applicationsUsed?: string | null;
  companySize?: string | null;
  message?: string | null;
  source?: {
    sourceUrl?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
  } | null;
  status: string;
  createdAt: string;
};

async function getQueries(token: string): Promise<Query[]> {
  // depth=1 so `industry` / `interestedInfrastructure` come back with names
  // rather than bare relationship ids.
  const res = await fetch(`${API_URL}/api/leads?limit=200&depth=1&sort=-createdAt`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.docs ?? [];
}

function relName(rel: Rel): string | null {
  if (rel && typeof rel === "object" && "name" in rel) return rel.name ?? null;
  return null;
}

// Explicit locale so the server-rendered string is deterministic.
function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

const CONTENT_COLLECTIONS = [
  { label: "Industries", slug: "industries" },
  { label: "Infrastructure", slug: "infrastructure" },
  { label: "Workloads", slug: "workloads" },
  { label: "Applications", slug: "applications" },
  { label: "Case Studies", slug: "case-studies" },
  { label: "Posts", slug: "posts" },
  { label: "Authors", slug: "authors" },
  { label: "FAQs", slug: "faqs" },
  { label: "Testimonials", slug: "testimonials" },
  { label: "Partners", slug: "partners" },
  { label: "Media", slug: "media" },
  { label: "Users", slug: "users" },
];

const CONTENT_GLOBALS = [
  { label: "Site Settings", slug: "site-settings" },
  { label: "Navigation", slug: "navigation" },
  { label: "CTA Blocks", slug: "cta-blocks" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-accent/20 text-[#e6a4ae]",
  contacted: "bg-blue-500/20 text-blue-300",
  qualified: "bg-amber-500/20 text-amber-300",
  proposal: "bg-purple-500/20 text-purple-300",
  won: "bg-green-500/20 text-green-300",
  lost: "bg-[#43484d] text-ink-muted",
};

export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const token = await getAdminToken();
  const queries = token ? await getQueries(token) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Signed in as {user.email} ({user.role})
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Queries */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-bold">Queries</h2>
          <span className="text-sm text-ink-muted">
            {queries.length} {queries.length === 1 ? "submission" : "submissions"}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Everything submitted through the site&rsquo;s contact and requirement forms.
        </p>

        {queries.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-[#43484d] px-6 py-12 text-center text-sm text-ink-muted">
            No queries yet. Submissions from the contact form will appear here.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {queries.map((q) => (
              <QueryCard key={q.id} query={q} />
            ))}
          </div>
        )}
      </section>

      {/* Content management */}
      <section className="mt-14">
        <h2 className="font-display text-lg font-bold">Manage Content</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Opens the full editor (add, edit, upload images, manage relationships) in the CMS admin.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[
            ...CONTENT_COLLECTIONS.map((c) => ({ ...c, kind: "collections" as const })),
            ...CONTENT_GLOBALS.map((g) => ({ ...g, kind: "globals" as const })),
          ].map((entry) => (
            <a
              key={entry.slug}
              href={`${API_URL}/admin/${entry.kind}/${entry.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[#43484d] bg-[#2e3236] px-4 py-3 text-sm text-white transition-colors hover:border-accent"
            >
              {entry.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function QueryCard({ query: q }: { query: Query }) {
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
    <article className="rounded-lg border border-[#43484d] bg-[#2e3236] p-5 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-white">{q.company}</h3>
          <p className="mt-0.5 text-sm text-ink-muted-2">{q.name}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              STATUS_STYLES[q.status] || STATUS_STYLES.new
            }`}
          >
            {q.status}
          </span>
          <time className="text-xs text-ink-muted">{formatDate(q.createdAt)}</time>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <a href={`mailto:${q.email}`} className="text-ink-muted-2 hover:text-accent">
          {q.email}
        </a>
        {q.phone && (
          <a href={`tel:${q.phone.replace(/\s+/g, "")}`} className="text-ink-muted-2 hover:text-accent">
            {q.phone}
          </a>
        )}
      </div>

      {meta.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-[#3a3f44] pt-4 sm:grid-cols-2">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">{m.label}</dt>
              <dd className="mt-0.5 text-sm text-ink-muted-2">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {q.workloadDescription && (
        <div className="mt-4 border-t border-[#3a3f44] pt-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Requirement</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-white">{q.workloadDescription}</p>
        </div>
      )}

      {q.message && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-ink-muted">Additional details</div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted-2">{q.message}</p>
        </div>
      )}

      {origin && (
        <p className="mt-4 border-t border-[#3a3f44] pt-3 text-xs text-ink-muted">
          Came from: <span className="break-all">{origin}</span>
        </p>
      )}
    </article>
  );
}
