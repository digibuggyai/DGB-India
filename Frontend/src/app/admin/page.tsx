import { redirect } from "next/navigation";
import { getAdminUser, getAdminToken } from "@/lib/admin-auth";
import { LogoutButton } from "./LogoutButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  workloadDescription?: string;
  status: string;
  createdAt: string;
};

async function getLeads(token: string): Promise<Lead[]> {
  const res = await fetch(`${API_URL}/api/leads?limit=100&sort=-createdAt`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.docs ?? [];
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
  const leads = token ? await getLeads(token) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Signed in as {user.email} ({user.role})
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold">Manage Content</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Opens the full editor (add, edit, upload images, manage relationships) in the CMS admin.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CONTENT_COLLECTIONS.map((c) => (
            <a
              key={c.slug}
              href={`${API_URL}/admin/collections/${c.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[#43484d] bg-[#2e3236] px-4 py-3 text-sm text-white transition-colors hover:border-accent"
            >
              {c.label}
            </a>
          ))}
          {CONTENT_GLOBALS.map((g) => (
            <a
              key={g.slug}
              href={`${API_URL}/admin/globals/${g.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-[#43484d] bg-[#2e3236] px-4 py-3 text-sm text-white transition-colors hover:border-accent"
            >
              {g.label}
            </a>
          ))}
        </div>
      </div>

      <h2 className="font-display mt-10 text-lg font-bold">Recent Leads</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-[#43484d]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#43484d] bg-[#2e3236] text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Requirement</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  No leads yet.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-[#3a3f44] last:border-0">
                <td className="px-4 py-4 align-top font-medium text-white">{lead.company}</td>
                <td className="px-4 py-4 align-top">
                  <div className="text-white">{lead.name}</div>
                  <a href={`mailto:${lead.email}`} className="text-ink-muted hover:text-accent">
                    {lead.email}
                  </a>
                  {lead.phone && <div className="text-ink-muted">{lead.phone}</div>}
                </td>
                <td className="max-w-xs px-4 py-4 align-top text-ink-muted-2">
                  {lead.workloadDescription || "—"}
                </td>
                <td className="px-4 py-4 align-top">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-ink-muted">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
