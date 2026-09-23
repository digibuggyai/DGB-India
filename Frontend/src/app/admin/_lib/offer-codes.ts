import "server-only";
import { getAdminToken } from "@/lib/admin-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/* The discount codes the configurator's consultation offer has handed out.
 * Staff-only: every row carries a customer's name, email and phone. */

export type OfferCode = {
  id: number;
  code: string;
  status: "issued" | "used" | "void";
  valueMax?: number | null;
  customerName: string;
  company?: string | null;
  email: string;
  phone?: string | null;
  configuration?: string | null;
  sourceUrl?: string | null;
  usedAt?: string | null;
  notes?: string | null;
  createdAt: string;
};

export async function getOfferCodes(limit = 300): Promise<OfferCode[]> {
  const token = await getAdminToken();
  if (!token) return [];

  const res = await fetch(`${API_URL}/api/nas-offer-codes?limit=${limit}&depth=0&sort=-createdAt`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { docs?: OfferCode[] };
  return data.docs ?? [];
}
