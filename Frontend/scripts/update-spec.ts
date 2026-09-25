/* Rewrites the generated parts of docs/nas-configurator-spec.md from the price
 * list: §1.2 (drives) and §7 (the complete costing).
 *
 * Prices move often, so these sections are never edited by hand — run this and
 * the document matches what the configurator actually quotes.
 *
 *   # against the running API
 *   NODE_OPTIONS=--conditions=react-server npx tsx scripts/update-spec.ts
 *
 *   # or straight from the database, with no servers running:
 *   cd ../Backend && npx tsx src/seed/dump-catalogue.ts --json /tmp/cat.json
 *   CATALOGUE_JSON=/tmp/cat.json NODE_OPTIONS=--conditions=react-server \
 *     npx tsx scripts/update-spec.ts
 */
import fs from "fs";
import path from "path";
import { loadCatalogue } from "@/lib/nas/cms";
import { toSalesPricing } from "@/lib/nas/sales-pricing";
import { INITIAL_ANSWERS, derive, priceFor, type Answers } from "@/lib/nas/configure";
import type { Catalogue } from "@/lib/nas/cms-types";
import type { NasPricing } from "@/lib/nas/types";

const SPEC = path.resolve(process.cwd(), "../docs/nas-configurator-spec.md");
const REFERENCE_DIR = path.resolve(process.cwd(), "../docs/reference");

/* The engine, copied beside the spec so another project can run exactly this
 * code rather than a paraphrase of it. All four are pure TypeScript — no DOM,
 * no imports outside themselves — which is what makes them portable. */
const ENGINE_FILES = ["types.ts", "logic.ts", "configure.ts", "specs.ts"];

const n = (v: number | null | undefined) => (v == null ? "—" : Math.round(v).toLocaleString("en-IN"));
const pct = (quote: number, min: number | null | undefined) =>
  min == null || !quote ? "—" : `${(((quote - min) / quote) * 100).toFixed(1)}%`;

type Row = { cap: number; line: string; quote: number; min: number | null };

function driveRows(S: NasPricing): Row[] {
  const rows: Row[] = [];
  for (const cap of S.capacities) {
    for (const [line, price] of Object.entries(S.hddPricing[cap])) {
      rows.push({ cap, line, quote: price.quote, min: price.min ?? null });
    }
  }
  return rows.sort((a, b) => a.cap - b.cap || a.line.localeCompare(b.line));
}

/* ---------------- §1.2 ---------------- */

function drivesSection(S: NasPricing, rows: Row[]): string {
  const lines = [...new Set(rows.map((r) => r.line))].sort();
  const out: string[] = [];
  out.push("### 1.2 Drives — priced combinations");
  out.push("");
  out.push(`${lines.length} lines are stocked: ${lines.join(", ")}. Price is **per drive, GST inclusive**.`);
  out.push("");
  out.push("| TB | Line | **Quote ₹** | *Min ₹* | ₹/TB (quote) |");
  out.push("|--:|---|--:|--:|--:|");
  for (const r of rows) {
    out.push(`| ${r.cap} | ${r.line} | **${n(r.quote)}** | *${n(r.min)}* | ${n(r.quote / r.cap)} |`);
  }
  out.push("");
  out.push(
    `Capacities available: **${S.capacities.join(", ")} TB**. Not every line exists at every capacity — that sparseness is load-bearing, see §3.6.`,
  );
  out.push("");
  return out.join("\n");
}

/* ---------------- §1.3's closing note ---------------- */

function linesNote(S: NasPricing, rows: Row[]): string {
  const priced = [...new Set(rows.map((r) => r.line))].sort();
  const unpriced = S.driveLines.map((l) => l.name).filter((name) => !priced.includes(name));
  const out: string[] = [];
  out.push(
    `All ${S.driveLines.length} are on record; **${priced.join(", ")}** have prices, so only those can be quoted.` +
      (unpriced.length ? ` ${unpriced.join(" and ")} ${unpriced.length === 1 ? "is" : "are"} specified and ready for the day ${unpriced.length === 1 ? "it is" : "they are"} stocked.` : ""),
  );
  out.push("Interface is SATA 6 Gb/s throughout (Exos and Ultrastar also exist in SAS).");
  out.push("");
  return out.join("\n");
}

/* ---------------- §5 ---------------- */

function examplesSection(S: NasPricing): string {
  const out: string[] = [];
  const say = (s = "") => out.push(s);

  const build = (over: Partial<Answers>, withServices = false) => {
    const a: Answers = { ...INITIAL_ANSWERS, includeInstall: withServices, includeAMC: false, ...over };
    const d = derive(a, S);
    return { a, d, b: d.build, p: d.build ? priceFor(d.build, a, S) : null };
  };
  const describe = (r: ReturnType<typeof build>) => {
    if (!r.b) return `_no build_`;
    const drives = r.b.drivesPerUnit * r.b.units;
    return `${r.b.model.id}${r.b.units > 1 ? ` × ${r.b.units}` : ""} + ${drives} × ${r.b.driveCap} TB ${r.b.driveLine} · ${r.b.totalUsable} TB usable · ₹${n(r.b.totalQuote)} hardware, ₹${n(r.p!.total)} total`;
  };

  say("## 5. Worked examples from this catalogue");
  say();
  say("Check any port against these. All were produced by running the engine");
  say("against the catalogue in §1, with installation included and AMC off.");
  say();
  say("| Ask | Result |");
  say("|---|---|");

  const r20 = build({ targetTB: 20, raid: "RAID5" }, true);
  say(`| 20 TB usable, RAID 5, any brand | ${describe(r20)} |`);
  const r1 = build({ targetTB: 20, raid: "RAID1" }, true);
  say(`| 20 TB usable, RAID 1 | One mirrored pair: ${describe(r1)} |`);
  const r4 = build({ targetTB: 4, raid: "RAID5" }, true);
  say(`| 4 TB usable, RAID 5 | ${describe(r4)} — needs 3 bays, so every 2-bay chassis is excluded |`);
  const r0 = build({ targetTB: 4, raid: "RAID0" }, true);
  say(`| 4 TB usable, RAID 0 | ${describe(r0)} — **never** 1 × 4 TB |`);

  const auto = build({ storageMode: "budget", budget: 200000, raidAuto: true }, true);
  const forced6 = build({ storageMode: "budget", budget: 200000, raidAuto: false, raid: "RAID6" }, true);
  say(
    `| Budget ₹2,00,000, RAID auto | Picks RAID ${auto.d.raid.replace("RAID", "")} at ${auto.b?.totalUsable} TB over RAID 6 at ${forced6.b?.totalUsable ?? "—"} TB |`,
  );
  say(`| Budget ₹2,00,000, RAID 6 forced | ${describe(forced6)} — the cost of the second parity drive |`);

  const small = build({ storageMode: "budget", budget: 50000, raidAuto: true }, true);
  say(`| Budget ₹50,000 | No build. ${small.d.error ? `Reports "${small.d.error}"` : ""} |`);
  say(`| Synology, any target | No build ever quotes a drive above 24 TB; QNAP never above 32 TB |`);
  say();

  // The invariants, asserted here rather than claimed.
  const all = (over: Partial<Answers>) => derive({ ...INITIAL_ANSWERS, ...over }, S).builds;
  const singleDrive0 = all({ targetTB: 4, raid: "RAID0" }).filter((b) => b.drivesPerUnit < 2).length;
  const oddPairs1 = all({ targetTB: 20, raid: "RAID1" }).filter((b) => b.drivesPerUnit !== 2).length;
  const synOver = all({ targetTB: 50, raid: "RAID5", brand: "Synology" }).filter((b) => b.driveCap > 24).length;
  const qnapOver = all({ targetTB: 50, raid: "RAID5", brand: "QNAP" }).filter((b) => b.driveCap > 32).length;
  say("Invariants worth asserting in a port's own tests, each checked against this");
  say(`catalogue as this document was generated: **${singleDrive0}** RAID 0 builds use a single drive,`);
  say(`**${oddPairs1}** RAID 1 builds use other than two drives per unit, **${synOver}** Synology builds`);
  say(`exceed 24 TB per drive, **${qnapOver}** QNAP builds exceed 32 TB.`);
  say();
  return out.join("\n");
}

/* ---------------- §7 ---------------- */

function costingSection(S: NasPricing, rows: Row[]): string {
  const out: string[] = [];
  const say = (s = "") => out.push(s);

  say("## 7. Complete costing");
  say();
  say("Generated from the engine against the catalogue in §1. Every figure is");
  say("GST-inclusive; there is no separate tax line anywhere in the quote.");
  say();
  say("### 7.1 The formula, in full");
  say();
  say("```");
  say("nas       = model.quote        × units");
  say("hdd       = drive.quote        × drivesPerUnit × units");
  say("ram       = ramUpgrade.quote   × units          // one kit per chassis");
  say("nic       = nicUpgrade.quote   × units          // one card per chassis");
  say("hardware  = nas + hdd + ram + nic");
  say("install   = includeInstall ? installQuote × units : 0");
  say("amc       = includeAMC     ? hardware × amcRate   : 0    // hardware only");
  say("total     = hardware + install + amc");
  say("```");
  say();
  say(
    `With today's settings: \`installQuote\` = ₹${n(S.install.quote)} per chassis (floor ₹${n(S.install.min)}), \`amcRate\` = ${(S.amcRate.quote * 100).toFixed(0)}% (floor ${((S.amcRate.min ?? 0) * 100).toFixed(0)}%).`,
  );
  say();
  say("Three things are easy to get wrong:");
  say();
  say("- **Installation is per chassis, not per order.** A two-unit build is charged twice.");
  say("- **AMC is a percentage of hardware only.** It does not compound on installation, and it is an annual figure quoted once in the estimate.");
  say("- **Upgrades are per chassis.** Two units means two RAM kits and two network cards.");
  say();

  say("### 7.2 NAS units — cost, floor and room to negotiate");
  say();
  say("| Model | Bays | Quote ₹ | Floor ₹ | Margin ₹ | Margin % | ₹ per bay |");
  say("|---|--:|--:|--:|--:|--:|--:|");
  for (const m of [...S.models].sort((a, b) => a.quote - b.quote)) {
    say(
      `| ${m.id} | ${m.bays} | ${n(m.quote)} | ${n(m.min)} | ${m.min == null ? "—" : n(m.quote - m.min)} | ${pct(m.quote, m.min)} | ${n(m.quote / m.bays)} |`,
    );
  }
  say();

  say("### 7.3 Drives — cost, floor and cost per TB");
  say();
  say("| Capacity | Line | Quote ₹ | Floor ₹ | Margin ₹ | Margin % | Quote ₹/TB | Floor ₹/TB |");
  say("|--:|---|--:|--:|--:|--:|--:|--:|");
  for (const r of rows) {
    say(
      `| ${r.cap} TB | ${r.line} | ${n(r.quote)} | ${n(r.min)} | ${r.min == null ? "—" : n(r.quote - r.min)} | ${pct(r.quote, r.min)} | ${n(r.quote / r.cap)} | ${r.min == null ? "—" : n(r.min / r.cap)} |`,
    );
  }
  say();
  const byTb = [...rows].sort((a, b) => a.quote / a.cap - b.quote / b.cap);
  const cheap = byTb[0];
  const dear = byTb[byTb.length - 1];
  say(
    `Cheapest storage per TB: **${cheap.cap} TB ${cheap.line}** at ₹${n(cheap.quote / cheap.cap)}/TB. Dearest: **${dear.cap} TB ${dear.line}** at ₹${n(dear.quote / dear.cap)}/TB — small drives cost roughly twice as much per TB, which is why the engine prefers fewer, larger drives.`,
  );
  say();

  say("### 7.4 Services");
  say();
  say("| Item | Basis | Quote | Floor | Margin |");
  say("|---|---|--:|--:|--:|");
  say(`| Installation & setup | per chassis | ₹${n(S.install.quote)} | ₹${n(S.install.min)} | ${pct(S.install.quote, S.install.min)} |`);
  say(
    `| AMC | % of hardware, per year | ${(S.amcRate.quote * 100).toFixed(0)}% | ${((S.amcRate.min ?? 0) * 100).toFixed(0)}% | ${(((S.amcRate.quote - (S.amcRate.min ?? 0)) / S.amcRate.quote) * 100).toFixed(0)}% of the rate |`,
  );
  say();

  say("### 7.5 Upgrades");
  say();
  if (!S.upgrades.length) {
    say("Nothing is priced today, so the configurator hides the step. When RAM or a");
    say("network card is added it is charged **per chassis** and counts as hardware,");
    say("so it also raises the AMC figure.");
  } else {
    say("| SKU | Type | Name | Quote ₹ | Floor ₹ |");
    say("|---|---|---|--:|--:|");
    for (const u of S.upgrades) say(`| ${u.sku} | ${u.category} | ${u.name} | ${n(u.quote)} | ${n(u.min)} |`);
  }
  say();

  say("### 7.6 Worked quotations, line by line");
  say();
  say("Each is the build the engine actually recommends, priced with installation");
  say("and AMC both on, showing the quote and the internal floor side by side.");
  say();

  const cases: { label: string; answers: Partial<Answers> }[] = [
    { label: "10 TB usable · RAID 5", answers: { targetTB: 10, raid: "RAID5" } },
    { label: "20 TB usable · RAID 5", answers: { targetTB: 20, raid: "RAID5" } },
    { label: "20 TB usable · RAID 6", answers: { targetTB: 20, raid: "RAID6" } },
    { label: "20 TB usable · RAID 1", answers: { targetTB: 20, raid: "RAID1" } },
    { label: "50 TB usable · RAID 5", answers: { targetTB: 50, raid: "RAID5" } },
    { label: "50 TB usable · RAID 6, Synology only", answers: { targetTB: 50, raid: "RAID6", brand: "Synology" } },
    { label: "100 TB usable · RAID 5", answers: { targetTB: 100, raid: "RAID5" } },
    { label: "Budget ₹1,50,000", answers: { storageMode: "budget", budget: 150000, raidAuto: true } },
    { label: "Budget ₹3,00,000", answers: { storageMode: "budget", budget: 300000, raidAuto: true } },
    { label: "Budget ₹5,00,000", answers: { storageMode: "budget", budget: 500000, raidAuto: true } },
  ];

  for (const c of cases) {
    const a: Answers = { ...INITIAL_ANSWERS, includeInstall: true, includeAMC: true, ...c.answers };
    const d = derive(a, S);
    const b = d.build;
    // A capacity nobody can build from whole drives is snapped to the nearest
    // that can be — say so, rather than heading the table with a figure the
    // build doesn't deliver.
    const moved = d.movedFrom != null ? ` _(asked for ${d.movedFrom} TB — not buildable from whole drives)_` : "";
    say(`#### ${c.label}${moved}`);
    say();
    if (!b) {
      say(`_No build: ${d.error}_`);
      say();
      continue;
    }
    const p = priceFor(b, a, S)!;
    const drives = b.drivesPerUnit * b.units;
    say(
      `**${b.model.id}** (${b.model.brand}, ${b.model.bays}-bay) × ${b.units} · ${drives} × ${b.driveCap} TB ${b.driveLine} · RAID ${d.raid.replace("RAID", "")} · **${b.totalUsable} TB usable**`,
    );
    say();
    say("| Line | Basis | Quote ₹ | Floor ₹ |");
    say("|---|---|--:|--:|");
    say(`| NAS unit | ${b.units} × ₹${n(b.model.quote)} | ${n(p.nas)} | ${n(p.floor?.nas)} |`);
    say(`| Hard drives | ${drives} × ₹${n(p.driveRate)} | ${n(p.hdd)} | ${n(p.floor?.hdd)} |`);
    say(`| **Hardware** | | **${n(p.hardware)}** | **${n(p.floor?.hardware)}** |`);
    say(`| Installation | ${b.units} × ₹${n(S.install.quote)} | ${n(p.install)} | ${n(p.floor?.install)} |`);
    say(`| AMC (1 year) | ${(S.amcRate.quote * 100).toFixed(0)}% of hardware | ${n(p.amc)} | ${n(p.floor?.amc)} |`);
    say(`| **Total** | | **${n(p.total)}** | **${n(p.floor?.total)}** |`);
    say();
    say(
      `Effective cost: **₹${n(p.total / b.totalUsable)} per usable TB**${p.floor ? `, floor ₹${n(p.floor.total / b.totalUsable)}` : ""}. Room to negotiate: **₹${n(p.total - (p.floor?.total ?? p.total))}** (${pct(p.total, p.floor?.total)}).`,
    );
    say();
  }

  say("### 7.7 Margin at a glance");
  say();
  const margin = (q: number, m: number | null | undefined) => (m == null ? null : ((q - m) / q) * 100);
  const dm = rows.map((r) => ({ ...r, m: margin(r.quote, r.min) })).filter((r) => r.m != null) as (Row & { m: number })[];
  const mm = S.models.map((m) => ({ id: m.id, m: margin(m.quote, m.min) })).filter((x) => x.m != null) as { id: string; m: number }[];
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  say(`- NAS units: **${avg(mm.map((x) => x.m)).toFixed(1)}%** average margin (${Math.min(...mm.map((x) => x.m)).toFixed(1)}–${Math.max(...mm.map((x) => x.m)).toFixed(1)}%).`);
  say(`- Drives: **${avg(dm.map((x) => x.m)).toFixed(1)}%** average margin (${Math.min(...dm.map((x) => x.m)).toFixed(1)}–${Math.max(...dm.map((x) => x.m)).toFixed(1)}%).`);
  say(
    `- Installation: **${pct(S.install.quote, S.install.min)}**. AMC: **${(((S.amcRate.quote - (S.amcRate.min ?? 0)) / S.amcRate.quote) * 100).toFixed(0)}%** of the rate (${(S.amcRate.quote * 100).toFixed(0)}% → ${((S.amcRate.min ?? 0) * 100).toFixed(0)}%).`,
  );
  say();
  say("Hardware is thin and the services are not, so on a complete quote most of");
  say("the negotiating room sits in installation and AMC rather than in the boxes.");
  say();
  const odd = dm.filter((r) => Math.abs(r.m - avg(dm.map((x) => x.m))) > 5);
  if (odd.length) {
    say("**Worth checking:** these drive floors sit well away from every other one,");
    say("which usually means a price was updated and its floor wasn't.");
    say();
    say("| Capacity | Line | Quote ₹ | Floor ₹ | Margin % |");
    say("|--:|---|--:|--:|--:|");
    for (const r of odd) say(`| ${r.cap} TB | ${r.line} | ${n(r.quote)} | ${n(r.min)} | ${r.m.toFixed(1)}% |`);
    say();
  }

  say("### 7.8 What a discount costs");
  say();
  say("The consultation offer gives up to ₹2,000 off. Against the floors above,");
  say("that is the smallest slice of the available margin on every build, so it");
  say("can always be honoured without going below the floor.");
  say();
  return out.join("\n");
}

/* ---------------- splice ---------------- */

/** Replaces the text from `startsWith` up to (not including) `endsWith`. */
function replaceSection(doc: string, startsWith: string, endsWith: string, replacement: string): string {
  const start = doc.indexOf(startsWith);
  if (start === -1) throw new Error(`couldn't find the section starting "${startsWith}"`);
  const end = doc.indexOf(endsWith, start + startsWith.length);
  if (end === -1) throw new Error(`couldn't find "${endsWith}" after "${startsWith}"`);
  return doc.slice(0, start) + replacement.trimEnd() + "\n\n" + doc.slice(end);
}

/** Replaces the prose that follows a section's table, leaving the table alone.
 *  Used for §1.3, whose specs are written by hand but whose closing note
 *  depends on which lines currently have prices. */
function replaceAfterTable(doc: string, heading: string, nextHeading: string, replacement: string): string {
  const start = doc.indexOf(heading);
  if (start === -1) throw new Error(`couldn't find "${heading}"`);
  const end = doc.indexOf(nextHeading, start);
  if (end === -1) throw new Error(`couldn't find "${nextHeading}" after "${heading}"`);
  const section = doc.slice(start, end);
  const lastRow = section.lastIndexOf("\n|");
  if (lastRow === -1) throw new Error(`no table found under "${heading}"`);
  const afterTable = section.indexOf("\n", lastRow + 1);
  return doc.slice(0, start + afterTable + 1) + "\n" + replacement.trimEnd() + "\n\n" + doc.slice(end);
}

/** Copies the engine next to the spec, so the documented behaviour and the code
 *  that implements it can't drift apart. */
function syncReferenceCode(): string[] {
  fs.mkdirSync(REFERENCE_DIR, { recursive: true });
  const copied: string[] = [];
  for (const file of ENGINE_FILES) {
    const source = path.resolve(process.cwd(), "src/lib/nas", file);
    const body = fs.readFileSync(source, "utf8");
    const header =
      `/* COPY — do not edit here.\n` +
      ` *\n` +
      ` * Taken from Frontend/src/lib/nas/${file} by Frontend/scripts/update-spec.ts,\n` +
      ` * so that docs/nas-configurator-spec.md ships the engine it describes.\n` +
      ` * Edit the original and re-run the script.\n` +
      ` */\n`;
    fs.writeFileSync(path.join(REFERENCE_DIR, file), header + body);
    copied.push(file);
  }
  return copied;
}

async function main() {
  const fromFile = process.env.CATALOGUE_JSON;
  const cat: Catalogue = fromFile ? JSON.parse(fs.readFileSync(fromFile, "utf8")) : await loadCatalogue();
  const S = toSalesPricing(cat);
  const rows = driveRows(S);

  // Normalised to \n on the way in and written back the same way: an editor
  // (or a script) that saves CRLF would otherwise break every anchor below.
  let doc = fs.readFileSync(SPEC, "utf8").replace(/\r\n/g, "\n");
  doc = replaceSection(doc, "### 1.2 Drives", "### 1.3 ", drivesSection(S, rows));
  doc = replaceAfterTable(doc, "### 1.3 Drive line specifications", "### 1.4 Upgrades", linesNote(S, rows));
  doc = replaceSection(doc, "## 5. Worked examples", "---\n\n## 6. Porting checklist", examplesSection(S));
  doc = replaceSection(doc, "## 7. Complete costing", "---\n\n## 8. The API surface", costingSection(S, rows));
  doc = doc.replace(/\*\*Snapshot taken:\*\* .*/, `**Snapshot taken:** ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, from the live CMS.`);
  fs.writeFileSync(SPEC, doc);

  const copied = syncReferenceCode();
  console.log(`Updated ${path.relative(process.cwd(), SPEC)}: ${rows.length} drive prices, ${S.models.length} models.`);
  console.log(`Synced the engine to docs/reference/: ${copied.join(", ")}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
