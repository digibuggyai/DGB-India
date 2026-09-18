import type { Catalogue } from "./cms-types";

/* The price list as a sheet: one block per kind of item, ready to become a CSV
 * or a PDF table.
 *
 * This is the internal sheet — it carries the floor price and the margin beside
 * every quote, so it is produced only inside the admin panel and only from a
 * catalogue loaded with a staff token. */

export type Cell = string | number | null;
export type Section = { title: string; note?: string; columns: string[]; rows: Cell[][] };

const margin = (quote: number, floor: number | null | undefined): Cell[] =>
  floor == null ? [null, null] : [Math.round((quote - floor) * 100) / 100, Math.round(((quote - floor) / quote) * 1000) / 10];

const status = (active: boolean) => (active ? "Active" : "Hidden");

export function buildPriceSheet(c: Catalogue): Section[] {
  const models: Section = {
    title: "NAS units",
    columns: ["Model", "Brand", "Bays", "RAID levels", "Network", "Largest drive (TB)", "Quote (₹)", "Floor (₹)", "Margin (₹)", "Margin (%)", "Status"],
    rows: [...c.models]
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.bays - b.bays || a.quotePrice - b.quotePrice)
      .map((m) => [
        m.model,
        m.brand,
        m.bays,
        (m.raid ?? []).join(" / "),
        m.network ?? "",
        m.maxDriveTb ?? null,
        m.quotePrice,
        m.minPrice ?? null,
        ...margin(m.quotePrice, m.minPrice),
        status(m.active),
      ]),
  };

  const drives: Section = {
    title: "Hard drives",
    columns: ["Capacity (TB)", "Drive line", "Quote (₹)", "Floor (₹)", "Margin (₹)", "Margin (%)", "Status"],
    rows: [...c.drives]
      .sort((a, b) => a.capacityTb - b.capacityTb || a.line.localeCompare(b.line))
      .map((d) => [d.capacityTb, d.line, d.quotePrice, d.minPrice ?? null, ...margin(d.quotePrice, d.minPrice), status(d.active)]),
  };

  const upgrades: Section = {
    title: "RAM & network cards",
    note: c.upgrades.length ? undefined : "None on the price list yet.",
    columns: ["Name", "Type", "SKU", "Brand", "Spec", "Quote (₹)", "Floor (₹)", "Margin (₹)", "Margin (%)", "Status"],
    rows: [...c.upgrades]
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
      .map((u) => [
        u.name,
        u.category === "NIC" ? "Network card" : "RAM",
        u.sku,
        u.brand ?? "",
        u.spec ?? "",
        u.quotePrice,
        u.minPrice ?? null,
        ...margin(u.quotePrice, u.minPrice),
        status(u.active),
      ]),
  };

  const s = c.settings;
  const services: Section = {
    title: "Installation & AMC",
    columns: ["Item", "Basis", "Quote", "Floor"],
    rows: [
      ["On-site installation & setup", "per NAS unit", s.installQuote == null ? null : `₹${s.installQuote.toLocaleString("en-IN")}`, s.installMin == null ? null : `₹${s.installMin.toLocaleString("en-IN")}`],
      ["Annual maintenance (AMC)", "% of hardware value", s.amcQuotePercent == null ? null : `${s.amcQuotePercent}%`, s.amcMinPercent == null ? null : `${s.amcMinPercent}%`],
    ],
  };

  return [models, drives, upgrades, services];
}

/** Excel opens this directly. A BOM keeps the rupee sign intact, and CRLF line
 *  endings keep older versions happy. */
export function toCsv(sections: Section[]): string {
  const esc = (v: Cell) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.split('"').join('""')}"` : s;
  };
  const lines: string[] = [`DGB India — NAS price sheet (internal)`, `Generated,${new Date().toLocaleString("en-IN")}`, `Contains floor prices — not for customers`, ""];
  for (const section of sections) {
    lines.push(section.title);
    lines.push(section.columns.map(esc).join(","));
    if (section.rows.length) lines.push(...section.rows.map((r) => r.map(esc).join(",")));
    else lines.push(section.note ?? "(none)");
    lines.push("");
  }
  return "\uFEFF" + lines.join("\r\n");
}

export function priceSheetFilename(ext: "csv" | "pdf"): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `DGB-India-NAS-price-sheet-${stamp}.${ext}`;
}

/** Hands the file to the browser. */
export function downloadFile(content: BlobPart, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
