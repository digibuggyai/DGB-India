/* Writes the catalogue as JSON another project can seed itself from.
 *
 * Quote prices only. Floor prices are left out on purpose: this file lives in
 * the repository and is meant to be copied into other codebases, and a floor
 * that reaches a browser is the one mistake this system is built to prevent.
 * Pass --with-floors to include them, and then keep the file off any machine
 * that serves a public site.
 *
 *   npx tsx src/seed/export-catalogue.ts                      → docs/reference/catalogue.json
 *   npx tsx src/seed/export-catalogue.ts out.json --with-floors
 */
import "../../scripts/load-env.mts";
import fs from "fs";
import path from "path";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

async function main() {
  const withFloors = process.argv.includes("--with-floors");
  const target = process.argv[2]?.startsWith("--")
    ? path.resolve(process.cwd(), "../docs/reference/catalogue.json")
    : (process.argv[2] ?? path.resolve(process.cwd(), "../docs/reference/catalogue.json"));

  const payload: any = await getPayload({ config });
  const all = (collection: string, sort: string) =>
    payload.find({ collection, limit: 500, sort, overrideAccess: true, depth: 0 }).then((r: any) => r.docs);

  const [models, drives, driveLines, upgrades] = await Promise.all([
    all("nas-models", "bays"),
    all("nas-drives", "capacityTb"),
    all("nas-drive-lines", "sortOrder"),
    all("nas-upgrades", "name"),
  ]);
  const settings = await payload.findGlobal({ slug: "nas-settings", overrideAccess: true });

  const money = (quote: number, min: number | null) => (withFloors ? { quote, min } : { quote });
  const drop = ["id", "createdAt", "updatedAt", "quotePrice", "minPrice"];
  const fields = (doc: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(doc).filter(([k, v]) => !drop.includes(k) && v !== null && v !== ""));

  const out = {
    exportedAt: new Date().toISOString(),
    currency: "INR",
    note: withFloors
      ? "Includes internal floor prices. Never serve this to a browser."
      : "Quote prices only, as the public site receives them.",
    models: models.filter((m: any) => m.active).map((m: any) => ({ ...fields(m), ...money(m.quotePrice, m.minPrice) })),
    drives: drives.filter((d: any) => d.active).map((d: any) => ({ ...fields(d), ...money(d.quotePrice, d.minPrice) })),
    driveLines: driveLines.map((l: any) => fields(l)),
    upgrades: upgrades.filter((u: any) => u.active).map((u: any) => ({ ...fields(u), ...money(u.quotePrice, u.minPrice) })),
    settings: withFloors
      ? {
          installQuote: settings.installQuote,
          installMin: settings.installMin,
          amcQuotePercent: settings.amcQuotePercent,
          amcMinPercent: settings.amcMinPercent,
        }
      : { installQuote: settings.installQuote, amcQuotePercent: settings.amcQuotePercent },
  };

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(out, null, 2));

  const leaked = !withFloors && /"min"|minPrice/.test(JSON.stringify(out));
  console.log(`Wrote ${out.models.length} models, ${out.drives.length} drive prices, ${out.driveLines.length} drive lines to ${target}.`);
  console.log(withFloors ? "Floor prices included — keep this file private." : leaked ? "WARNING: a floor price got through." : "No floor price anywhere in it.");
  process.exit(leaked ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
