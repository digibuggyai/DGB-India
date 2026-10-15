// Applies the hard drive price list in nas-drive-prices.ts to the CMS: adds
// sizes that aren't there yet, corrects prices that have moved, and switches
// off the ones the sheet no longer prices.
//
// Safe to re-run — it only writes rows that actually differ. Nothing is ever
// deleted: a drive that stops being sold is unticked, so past quotes still
// resolve and it can come back if stock does.
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";
import { DRIVES, HELD, WITHDRAWN } from "./nas-drive-prices";

const config = (importedConfig as any)?.default ?? importedConfig;
const inr = (v: unknown) => (typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : "—");

async function main() {
  const payload: any = await getPayload({ config });
  const created: string[] = [];
  const updated: string[] = [];
  let unchanged = 0;

  const findDrive = (capacityTb: number, line: string) =>
    payload
      .find({
        collection: "nas-drives",
        where: { and: [{ capacityTb: { equals: capacityTb } }, { line: { equals: line } }] },
        limit: 1,
        overrideAccess: true,
      })
      .then((r: any) => r.docs[0]);

  /* The sheet's rows. `active` is passed on create but deliberately not on
   * update: once a drive is in the CMS, whether it's shown is the team's call
   * from the Pricing tab, and a price refresh shouldn't overrule it. The one
   * exception is a held row, which is forced off until someone confirms it. */
  for (const [capacityTb, line, quotePrice, minPrice, held] of [
    ...DRIVES.map((d) => [...d, false] as const),
    ...HELD.map((d) => [...d, true] as const),
  ]) {
    const label = `${capacityTb} TB ${line}`;
    const doc = await findDrive(capacityTb, line);

    if (!doc) {
      await payload.create({
        collection: "nas-drives",
        data: { capacityTb, line, quotePrice, minPrice, active: !held },
        overrideAccess: true,
      });
      created.push(`${label} — ${inr(quotePrice)}${held ? " (switched off, see nas-drive-prices.ts)" : ""}`);
      continue;
    }

    const changes: Record<string, unknown> = {};
    if (doc.quotePrice !== quotePrice) changes.quotePrice = quotePrice;
    if (doc.minPrice !== minPrice) changes.minPrice = minPrice;
    if (held && doc.active) changes.active = false;

    if (!Object.keys(changes).length) {
      unchanged++;
      continue;
    }

    await payload.update({ collection: "nas-drives", id: doc.id, data: changes, overrideAccess: true });
    updated.push(
      `${label} — ${Object.entries(changes)
        .map(([k, v]) =>
          k === "active" ? "switched off" : `${k === "quotePrice" ? "quote" : "minimum"} ${inr(doc[k])} → ${inr(v)}`,
        )
        .join(", ")}`,
    );
  }

  // Drives the sheet has stopped pricing.
  const withdrawn: string[] = [];
  for (const [capacityTb, line] of WITHDRAWN) {
    const doc = await findDrive(capacityTb, line);
    if (!doc || !doc.active) continue;
    await payload.update({ collection: "nas-drives", id: doc.id, data: { active: false }, overrideAccess: true });
    withdrawn.push(`${capacityTb} TB ${line}`);
  }

  const all = await payload.find({ collection: "nas-drives", limit: 500, overrideAccess: true, depth: 0 });
  const known = new Set([...DRIVES, ...HELD].map(([c, l]) => `${c}|${l}`));
  const extra = all.docs.filter((d: any) => !known.has(`${d.capacityTb}|${d.line}`)).map((d: any) => `${d.capacityTb} TB ${d.line}`);

  console.log(`Added ${created.length}:`);
  for (const c of created) console.log(`  + ${c}`);
  console.log(`Updated ${updated.length}:`);
  for (const u of updated) console.log(`  ~ ${u}`);
  if (withdrawn.length) console.log(`Switched off (no longer priced): ${withdrawn.join(", ")}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Drives in the CMS now: ${all.totalDocs} (${all.docs.filter((d: any) => d.active).length} active)`);
  if (extra.length) console.log(`Not on the sheet, left alone: ${extra.join(", ")}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
