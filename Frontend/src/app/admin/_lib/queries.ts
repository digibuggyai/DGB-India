import "server-only";
import { getAdminToken } from "@/lib/admin-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Relationship fields come back populated (depth=1) as objects, or as a bare
// id if the related doc was removed.
export type Rel = { id: number | string; name?: string | null } | number | string | null;

export type Query = {
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

export async function getQueries(limit = 200): Promise<Query[]> {
  const token = await getAdminToken();
  if (!token) return [];

  // depth=1 so `industry` / `interestedInfrastructure` come back with names
  // rather than bare relationship ids.
  const res = await fetch(`${API_URL}/api/leads?limit=${limit}&depth=1&sort=-createdAt`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const data = await res.json();
  return data.docs ?? [];
}

export function relName(rel: Rel): string | null {
  if (rel && typeof rel === "object" && "name" in rel) return rel.name ?? null;
  return null;
}

// Explicit locale so the server-rendered string is deterministic.
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}
