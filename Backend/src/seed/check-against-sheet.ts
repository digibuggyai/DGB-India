/* Checks the live database against the Pricing sheet, parsed from the CSV
 * exported straight out of the Catalog workbook. Deliberately imports none of
 * the seed price files: those are what is under test.
 *
 * Export the Pricing sheet as CSV, then:
 *   npx tsx src/seed/check-against-sheet.ts path/to/pricing.csv
 *
 * Exits non-zero and lists every discrepancy, so it can gate a price update. */
import "../../scripts/load-env.mts";
import fs from "fs";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;
const CSV = process.argv[2];

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cell);
      cell = "";
    } else cell += ch;
  }
  out.push(cell);
  return out;
}

const num = (v: string | undefined) => {
  const digits = (v ?? "").replace(/[^0-9.]/g, "");
  return digits === "" ? null : Number(digits);
};

/* Sheet geometry, from the header row:
 *   A model  B brand  C (unlabelled)  D quote  E with-tax minimum
 *   I capacity  J..M drive quotes      Q capacity  R..U drive minimums */
const LINES = ["Exos", "IronWolf", "WD Ultrastar", "IronWolf Pro"];

/** Rows the team has deliberately switched off, with why. */
const EXPECTED_OFF: Record<string, string> = {
  "18 TB Exos": "held: priced the same as the 30 TB, which reads as a slip",
  "6 TB WD Ultrastar": "withdrawn: priced 0 on the sheet",
};

(async () => {
  const rows = fs.readFileSync(CSV, "utf8").split(/\r?\n/).map(parseLine);

  const sheetModels = new Map<string, { quote: number; min: number }>();
  const sheetDrives = new Map<string, { quote: number; min: number }>();
  const notSold: string[] = [];

  for (const r of rows) {
    const model = (r[0] ?? "").trim();
    if (/^(DS|TS)/.test(model)) {
      const quote = num(r[3]);
      const min = num(r[4]);
      if (quote != null && min != null) sheetModels.set(model, { quote, min });
    }

    const capQ = (r[8] ?? "").trim();
    if (/^\d+\s*TB$/i.test(capQ)) {
      for (let i = 0; i < LINES.length; i++) {
        const label = `${parseInt(capQ)} TB ${LINES[i]}`;
        const q = num(r[9 + i]);
        if (q) sheetDrives.set(label, { quote: q, min: NaN });
        else notSold.push(label);
      }
    }
    const capM = (r[16] ?? "").trim();
    if (/^\d+\s*TB$/i.test(capM)) {
      for (let i = 0; i < LINES.length; i++) {
        const m = num(r[17 + i]);
        if (m) {
          const label = `${parseInt(capM)} TB ${LINES[i]}`;
          const entry = sheetDrives.get(label);
          if (entry) entry.min = m;
          else sheetDrives.set(label, { quote: NaN, min: m });
        }
      }
    }
  }

  const payload: any = await getPayload({ config });
  const models: any[] = (await payload.find({ collection: "nas-models", limit: 500, overrideAccess: true, depth: 0 })).docs;
  const drives: any[] = (await payload.find({ collection: "nas-drives", limit: 500, overrideAccess: true, depth: 0 })).docs;

  const problems: string[] = [];
  let okModels = 0;
  let okDrives = 0;
  let okOff = 0;

  for (const [model, { quote, min }] of sheetModels) {
    const doc = models.find((d) => d.model === model);
    if (!doc) {
      problems.push(`${model}: on the sheet but missing from the database`);
      continue;
    }
    if (doc.quotePrice !== quote) problems.push(`${model}: quote ₹${doc.quotePrice} ≠ sheet ₹${quote}`);
    else if (doc.minPrice !== min) problems.push(`${model}: floor ₹${doc.minPrice} ≠ sheet ₹${min}`);
    else if (doc.minPrice >= doc.quotePrice) problems.push(`${model}: floor is not below the quote`);
    else okModels++;
  }
  for (const doc of models) {
    if (!sheetModels.has(doc.model)) problems.push(`${doc.model}: in the database but not on the sheet`);
  }

  const byLabel = new Map(drives.map((d) => [`${d.capacityTb} TB ${d.line}`, d]));

  for (const [label, { quote, min }] of sheetDrives) {
    const doc = byLabel.get(label);
    if (Number.isNaN(quote) || Number.isNaN(min)) {
      problems.push(`${label}: the sheet gives a quote or a minimum but not both`);
      continue;
    }
    if (!doc) {
      problems.push(`${label}: sheet prices it at ₹${quote} but it is missing from the database`);
      continue;
    }
    if (doc.quotePrice !== quote) problems.push(`${label}: quote ₹${doc.quotePrice} ≠ sheet ₹${quote}`);
    else if (doc.minPrice !== min) problems.push(`${label}: floor ₹${doc.minPrice} ≠ sheet ₹${min}`);
    else if (doc.minPrice >= doc.quotePrice) problems.push(`${label}: floor is not below the quote`);
    else if (doc.active === label in EXPECTED_OFF) problems.push(`${label}: active=${doc.active}, expected ${!(label in EXPECTED_OFF)}`);
    else okDrives++;
  }

  for (const label of notSold) {
    const doc = byLabel.get(label);
    if (!doc) okOff++;
    else if (doc.active) problems.push(`${label}: priced 0 on the sheet but ACTIVE at ₹${doc.quotePrice}`);
    else if (!(label in EXPECTED_OFF)) problems.push(`${label}: switched off but not on the expected-off list`);
    else okOff++;
  }

  console.log(`Chassis matching the sheet:        ${okModels} / ${sheetModels.size}`);
  console.log(`Drives matching the sheet:         ${okDrives} / ${sheetDrives.size}`);
  console.log(`Drive cells correctly not sold:    ${okOff} / ${notSold.length}`);
  console.log(problems.length ? `\nPROBLEMS (${problems.length}):` : `\nNo discrepancies.`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(problems.length ? 1 : 0);
})();
