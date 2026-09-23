import { NextResponse } from "next/server";
import { forbidden, requireAdmin } from "@/lib/nas/admin-guard";
import { lookupModel, lookupUpgrade } from "@/lib/nas/auto-specs";

/* Proposes an item's specifications so a new NAS model or upgrade doesn't have
 * to be typed field by field. Admins only: it fetches a manufacturer's page on
 * the server, and nothing about the price list should be reachable otherwise.
 *
 * It only ever answers with values — saving stays with the admin, who sees
 * what was filled and from where. */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return forbidden();

  const body = (await req.json().catch(() => ({}))) as {
    kind?: string;
    model?: string;
    brand?: string;
    name?: string;
    sku?: string;
    text?: string;
  };

  const str = (v: unknown) => String(v ?? "").trim();

  if (body.kind === "upgrades") {
    const name = str(body.name);
    if (!name) return NextResponse.json({ error: "Type the upgrade's name first." }, { status: 400 });
    return NextResponse.json(lookupUpgrade({ name, sku: str(body.sku) }));
  }

  const model = str(body.model);
  const brand = str(body.brand);
  if (!model && !str(body.text)) return NextResponse.json({ error: "Type the model name first." }, { status: 400 });

  try {
    // A pasted sheet can be long; anything past this is page furniture.
    return NextResponse.json(await lookupModel({ model, brand, text: str(body.text).slice(0, 200_000) }));
  } catch (err) {
    console.error("[nas lookup]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Couldn't look those specifications up. Fill them in by hand." }, { status: 502 });
  }
}
