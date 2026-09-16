// Applies the hard drive price list in nas-drive-prices.ts to the CMS: adds
// sizes that aren't there yet and corrects prices that have moved.
//
// Safe to re-run — it only writes rows that actually differ. Drives in the CMS
// that the sheet no longer prices are reported, not deleted: withdrawing one is
// a decision for the team (untick Active in the admin Pricing tab).
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";
import { DRIVES } from "./nas-drive-prices";

const config = (importedConfig as any)?.default ?? importedConfig;

async function main() {
  const payload: any = await getPayload({ config });
  const created: string[] = [];
  const updated: string[] = [];
  let unchanged = 0;

  for (const [capacityTb, line, quotePrice, minPrice] of DRIVES) {
    const label = `${capacityTb} TB ${line}`;
    const found = await payload.find({
      collection: "nas-drives",
      where: { and: [{ capacityTb: { equals: capacityTb } }, { line: { equals: line } }] },
      limit: 1,
      overrideAccess: true,
    });
    const doc = found.docs[0];

    if (!doc) {
      await payload.create({ collection: "nas-drives", data: { capacityTb, line, quotePrice, minPrice, active: true }, overrideAccess: true });
      created.push(`${label} — ₹${quotePrice.toLocaleString("en-IN")}`);
      continue;
    }

    const changes: Record<string, number> = {};
    if (doc.quotePrice !== quotePrice) changes.quotePrice = quotePrice;
    if (doc.minPrice !== minPrice) changes.minPrice = minPrice;
    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }

    await payload.update({ collection: "nas-drives", id: doc.id, data: changes, overrideAccess: true });
    updated.push(
      `${label} — ${Object.entries(changes)
        .map(([k, v]) => `${k === "quotePrice" ? "quote" : "minimum"} ₹${doc[k]?.toLocaleString("en-IN") ?? "—"} → ₹${v.toLocaleString("en-IN")}`)
        .join(", ")}`,
    );
  }

  const all = await payload.find({ collection: "nas-drives", limit: 500, overrideAccess: true, depth: 0 });
  const sheet = new Set(DRIVES.map(([c, l]) => `${c}|${l}`));
  const extra = all.docs.filter((d: any) => !sheet.has(`${d.capacityTb}|${d.line}`)).map((d: any) => `${d.capacityTb} TB ${d.line}`);

  console.log(`Added ${created.length}:`);
  for (const c of created) console.log(`  + ${c}`);
  console.log(`Updated ${updated.length}:`);
  for (const u of updated) console.log(`  ~ ${u}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Drives in the CMS now: ${all.totalDocs}`);
  if (extra.length) console.log(`Not on the sheet, left alone: ${extra.join(", ")}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
