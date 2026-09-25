// Prints the whole NAS price list as Markdown tables, including the internal
// minimum prices, for porting the configurator elsewhere.
//
//   npx tsx src/seed/dump-catalogue.ts                 → Markdown on stdout
//   npx tsx src/seed/dump-catalogue.ts --json out.json → the raw catalogue,
//     in the shape the frontend's pricing functions take, so the docs can be
//     regenerated without the API being up.
import "../../scripts/load-env.mts";
import fs from "fs";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;
const inr = (v: any) => (typeof v === "number" ? v.toLocaleString("en-IN") : "—");

async function main() {
  const payload: any = await getPayload({ config });
  const q = (collection: string, sort: string) =>
    payload.find({ collection, limit: 500, sort, overrideAccess: true, depth: 0 }).then((r: any) => r.docs);

  const [models, drives, lines, upgrades] = await Promise.all([
    q("nas-models", "bays"),
    q("nas-drives", "capacityTb"),
    q("nas-drive-lines", "sortOrder"),
    q("nas-upgrades", "name"),
  ]);
  const settings = await payload.findGlobal({ slug: "nas-settings", overrideAccess: true });

  if (process.argv[2] === "--json") {
    const target = process.argv[3] ?? "catalogue.json";
    fs.writeFileSync(target, JSON.stringify({ models, drives, driveLines: lines, upgrades, settings, logs: [] }, null, 2));
    console.log(`Wrote ${models.length} models, ${drives.length} drive prices, ${lines.length} drive lines to ${target}.`);
    process.exit(0);
  }

  console.log("## NAS models\n");
  console.log("| Model | Brand | Bays | RAID | Network | Net. upgrade | CPU | RAM | Max RAM | M.2 | Max drive | Bays+exp | Expandable | Warranty | Quote | Min | Active |");
  console.log("|---|---|--:|---|---|---|---|---|---|--:|--:|--:|---|---|--:|--:|---|");
  for (const m of models) {
    console.log(
      `| ${m.model} | ${m.brand} | ${m.bays} | ${(m.raid ?? []).map((r: string) => r.replace("RAID", "")).join("/")} | ${m.network ?? ""} | ${m.networkUpgrade ?? ""} | ${m.cpu ?? ""} | ${m.memory ?? ""} | ${m.memoryMax ?? ""} | ${m.m2Slots ?? ""} | ${m.maxDriveTb ?? ""} | ${m.baysWithExpansion ?? ""} | ${m.expandable ? "yes" : "no"} | ${m.warranty ?? ""} | ${inr(m.quotePrice)} | ${inr(m.minPrice)} | ${m.active ? "yes" : "NO"} |`,
    );
  }

  console.log("\n## Drives\n");
  console.log("| TB | Line | Quote | Min | ₹/TB (quote) | Active |");
  console.log("|--:|---|--:|--:|--:|---|");
  for (const d of drives) {
    console.log(
      `| ${d.capacityTb} | ${d.line} | ${inr(d.quotePrice)} | ${inr(d.minPrice)} | ${inr(Math.round(d.quotePrice / d.capacityTb))} | ${d.active ? "yes" : "NO"} |`,
    );
  }

  console.log("\n## Drive lines (specs)\n");
  console.log("| Line | Brand | Class | Series | RPM | Cache | Interface | Recording | Workload | MTBF | Warranty | Made for |");
  console.log("|---|---|---|---|---|---|---|---|---|---|--:|---|");
  for (const l of lines) {
    console.log(
      `| ${l.name} | ${l.brand} | ${l.driveClass} | ${l.series ?? ""} | ${l.rpm ?? ""} | ${l.cache ?? ""} | ${l.interface ?? ""} | ${l.recording ?? ""} | ${l.workloadTbYear ?? ""} | ${l.mtbf ?? ""} | ${l.warrantyYears ?? ""} | ${l.madeForBrand ?? "—"} |`,
    );
  }

  console.log("\n## Upgrades\n");
  if (!upgrades.length) console.log("_None on the price list._");
  else {
    console.log("| SKU | Category | Name | Brand | Spec | Quote | Min | Active |");
    console.log("|---|---|---|---|---|--:|--:|---|");
    for (const u of upgrades) {
      console.log(`| ${u.sku} | ${u.category} | ${u.name} | ${u.brand ?? ""} | ${u.spec ?? ""} | ${inr(u.quotePrice)} | ${inr(u.minPrice)} | ${u.active ? "yes" : "NO"} |`);
    }
  }

  console.log("\n## Settings\n");
  console.log(`- Installation: quote ₹${inr(settings.installQuote)} per unit, minimum ₹${inr(settings.installMin)}`);
  console.log(`- AMC: quote ${settings.amcQuotePercent}% of hardware, minimum ${settings.amcMinPercent}%`);
  console.log(`\nCounts: ${models.length} models, ${drives.length} drive prices, ${lines.length} drive lines, ${upgrades.length} upgrades.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
