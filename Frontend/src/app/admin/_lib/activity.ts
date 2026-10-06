import "server-only";
import { getAdminToken } from "@/lib/admin-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/* Everything staff have changed: the price list, posts, enquiries, images,
 * accounts and discount codes. Admin-only — the entries name people and quote
 * what they edited. */

export type ActivityEntry = {
  id: number;
  action: "created" | "updated" | "deleted";
  itemType: string;
  itemLabel: string;
  collection?: string | null;
  itemId?: number | null;
  userEmail: string;
  userName?: string | null;
  changes?: { field: string; from: unknown; to: unknown }[] | null;
  createdAt: string;
};

export async function getActivity(limit = 500): Promise<ActivityEntry[]> {
  const token = await getAdminToken();
  if (!token) return [];

  const res = await fetch(`${API_URL}/api/nas-price-logs?limit=${limit}&depth=0&sort=-createdAt`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { docs?: ActivityEntry[] };
  return data.docs ?? [];
}
