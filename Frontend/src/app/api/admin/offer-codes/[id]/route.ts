import { NextResponse } from "next/server";
import { cmsErrorResponse, forbidden, requireAdmin } from "@/lib/nas/admin-guard";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

const STATUSES = new Set(["issued", "used", "void"]);

/* Marking a discount code used, void, or outstanding again.
 *
 * Only the status is editable from here — the code itself and whose it is are
 * what make it worth anything, so those can only be changed in the CMS. */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  const { id } = await ctx.params;
  if (!Number.isInteger(Number(id))) return NextResponse.json({ error: "Unknown code." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { status?: string; notes?: string };
  const status = String(body.status ?? "");
  if (!STATUSES.has(status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });

  try {
    const res = await fetch(`${API_URL}/api/nas-offer-codes/${Number(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `JWT ${auth.token}` },
      body: JSON.stringify({ status, ...(typeof body.notes === "string" ? { notes: body.notes } : {}) }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: "The CMS rejected that change." }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    return cmsErrorResponse(err);
  }
}
