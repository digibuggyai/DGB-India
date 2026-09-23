import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/nas/admin-guard";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

/* Deleting an enquiry.
 *
 * Admins only, here and in the CMS — an enquiry is a record of a real person
 * who contacted us, and losing one loses the customer. Sales staff can work a
 * lead but not erase it. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Only admins can delete enquiries." }, { status: 403 });

  const { id } = await ctx.params;
  if (!Number.isInteger(Number(id))) return NextResponse.json({ error: "Unknown enquiry." }, { status: 404 });

  try {
    const res = await fetch(`${API_URL}/api/leads/${Number(id)}`, {
      method: "DELETE",
      headers: { Authorization: `JWT ${auth.token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { errors?: { message?: string }[] };
      return NextResponse.json({ error: data.errors?.[0]?.message || "The CMS wouldn't delete it." }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[delete query]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't reach the CMS. Try again." }, { status: 502 });
  }
}
