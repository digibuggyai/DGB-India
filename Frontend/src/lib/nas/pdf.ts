import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyInfo, Estimate } from "./types";

/* The downloadable NAS estimate.
 *
 * Adapted from the DigiBuggy sales tool's quotation PDF, with two deliberate
 * differences. It's an estimate a visitor builds for themselves, so there is no
 * sales rep, signature or validity period. And the DGB logo is dark artwork on
 * an opaque ground, so the letterhead is white with a maroon rule rather than a
 * coloured band the logo couldn't sit on.
 *
 * Like the original it prints one price per line — the quote price. There is no
 * minimum anywhere in the data this receives.
 *
 * Imported on demand by the configurator, so jsPDF only loads when asked for. */

type RGB = [number, number, number];

const ACCENT: RGB = [128, 32, 44]; // --accent
const ACCENT_SOFT: RGB = [236, 220, 223]; // --tint
const INK: RGB = [16, 21, 28]; // --foreground
const MUTED: RGB = [92, 97, 102]; // --muted
const RULE: RGB = [229, 232, 234]; // --border

const LOGO_URL = "/dgb_logo.png";
const MARGIN = 42;
const FOOTER_RESERVE = 70;

type Logo = { data: string; w: number; h: number };

export async function downloadEstimatePdf(estimate: Estimate, company: CompanyInfo): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const logo = await loadLogo();

  let y = header(doc, estimate, company, pageW, logo);
  y = parties(doc, estimate, company, pageW, y);
  y = configuration(doc, estimate, pageW, y);
  y = lineItems(doc, estimate, pageW, y);
  notes(doc, estimate, pageW, pageH, y);

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    footer(doc, company, pageW, pageH, p, pages);
  }

  doc.save(filename(estimate));
}

/* ---------------- letterhead ---------------- */

function header(doc: jsPDF, e: Estimate, company: CompanyInfo, pageW: number, logo: Logo | null): number {
  const top = 36;
  const slotH = 46;

  if (logo) {
    let h = slotH;
    let w = (logo.w / logo.h) * h;
    if (w > 180) {
      w = 180;
      h = (logo.h / logo.w) * w;
    }
    doc.addImage(logo.data, "JPEG", MARGIN, top + (slotH - h) / 2, w, h);
  } else {
    setText(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(company.name, MARGIN, top + 30);
  }

  setText(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ESTIMATE", pageW - MARGIN, top + 14, { align: "right" });

  setText(doc, MUTED);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(e.ref, pageW - MARGIN, top + 30, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(new Date()), pageW - MARGIN, top + 43, { align: "right" });

  const ruleY = top + slotH + 16;
  setDraw(doc, ACCENT);
  doc.setLineWidth(3);
  doc.line(MARGIN, ruleY, pageW - MARGIN, ruleY);
  return ruleY + 30;
}

function parties(doc: jsPDF, e: Estimate, company: CompanyInfo, pageW: number, y: number): number {
  const cols: { label: string; lines: string[] }[] = [];
  const who = [e.customer.name, e.customer.company, e.customer.location].filter(Boolean);
  if (who.length) cols.push({ label: "Prepared for", lines: who });
  cols.push({ label: "From", lines: [company.name, company.email, company.phones[0] ?? ""].filter(Boolean) });
  cols.push({ label: "Status", lines: ["Indicative estimate", "Confirmed in a formal quotation"] });

  const colW = (pageW - MARGIN * 2) / cols.length;
  let tallest = 0;
  cols.forEach((col, i) => {
    const x = MARGIN + colW * i;
    setText(doc, ACCENT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(col.label.toUpperCase(), x, y);

    setText(doc, INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    col.lines.forEach((line, j) => doc.text(line, x, y + 15 + j * 12.5, { maxWidth: colW - 12 }));
    tallest = Math.max(tallest, col.lines.length);
  });

  return y + 15 + tallest * 12.5 + 22;
}

/* ---------------- what is being quoted ---------------- */

function configuration(doc: jsPDF, e: Estimate, pageW: number, y: number): number {
  y = sectionHeading(doc, "Configuration", pageW, y);

  const rows: [string, string][] = [
    ["NAS unit", `${e.model.id} · ${e.model.brand} · ${e.model.bays}-bay`],
    ...(e.units > 1 ? ([["Quantity", `${e.units} units`]] as [string, string][]) : []),
    ["Drives", `${e.totalDrives} × ${e.driveCap} TB ${e.driveLine}`],
    ["RAID level", e.raidLabel],
    ["Usable capacity", `${e.usableTB} TB`],
    ["Network", e.speed],
    ["Expansion", e.expandable ? "Expandable unit requested" : "Not requested"],
  ];

  const labelW = 110;
  doc.setFontSize(9.5);
  for (const [label, value] of rows) {
    setText(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(label, MARGIN, y);

    setText(doc, INK);
    doc.setFont("helvetica", "bold");
    doc.text(value, MARGIN + labelW, y, { maxWidth: pageW - MARGIN * 2 - labelW });
    y += 15;
  }
  return y + 12;
}

function lineItems(doc: jsPDF, e: Estimate, pageW: number, y: number): number {
  y = sectionHeading(doc, "Estimate", pageW, y);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_RESERVE },
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: e.lines.map((l) => [
      l.detail ? `${l.description}\n${l.detail}` : l.description,
      l.qty == null ? "" : String(l.qty),
      l.rate == null ? "" : rupees(l.rate),
      rupees(l.amount),
    ]),
    foot: [["Total (incl. GST)", "", "", rupees(e.total)]],
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: INK,
      cellPadding: { top: 8, bottom: 8, left: 8, right: 8 },
      lineColor: RULE,
      lineWidth: { bottom: 0.5 },
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      lineWidth: 0,
    },
    footStyles: {
      fillColor: ACCENT_SOFT,
      textColor: ACCENT,
      fontStyle: "bold",
      fontSize: 12,
      lineWidth: 0,
    },
    columnStyles: {
      1: { cellWidth: 46, halign: "center" },
      2: { cellWidth: 84, halign: "right" },
      3: { cellWidth: 100, halign: "right", fontStyle: "bold" },
    },
  });

  // autotable records where it finished on the document; it isn't in its types.
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY;
  return (finalY ?? y) + 8;
}

function notes(doc: jsPDF, e: Estimate, pageW: number, pageH: number, y: number) {
  const lines = [
    "This is an indicative estimate built from our current price list. Final pricing and availability are confirmed in a formal quotation.",
    "All prices include GST.",
    ...(e.units > 1 ? [`This configuration is delivered as ${e.units} units; installation is charged per unit.`] : []),
    "Network speed reflects the ports supplied with the unit. Add-in cards are not included unless listed above.",
    "Warranty as per manufacturer terms.",
  ];

  if (y > pageH - FOOTER_RESERVE - 120) {
    doc.addPage();
    y = MARGIN + 10;
  }

  y = sectionHeading(doc, "Notes", pageW, y + 8);
  setText(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(`•  ${line}`, pageW - MARGIN * 2) as string[];
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 11 + 3;
  }
}

/* The contact block. An estimate gets forwarded and acted on later, so the
   address and phone have to be on the page itself. */
function footer(doc: jsPDF, company: CompanyInfo, pageW: number, pageH: number, page: number, pages: number) {
  const contact = [company.phones.join("  ·  "), company.email].filter(Boolean).join("   ·   ");
  const lines = [company.address, contact].filter(Boolean);
  const top = pageH - lines.length * 10 - 30;

  setDraw(doc, ACCENT);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, top, pageW - MARGIN, top);

  setText(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(company.name.toUpperCase(), MARGIN, top + 14);

  setText(doc, MUTED);
  doc.setFont("helvetica", "normal");
  lines.forEach((line, i) => doc.text(line, pageW - MARGIN, top + 14 + i * 10, { align: "right" }));
  if (pages > 1) doc.text(`Page ${page} of ${pages}`, MARGIN, top + 26);
}

/* ---------------- helpers ---------------- */

function sectionHeading(doc: jsPDF, label: string, pageW: number, y: number): number {
  setText(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), MARGIN, y);

  setDraw(doc, RULE);
  doc.setLineWidth(1);
  doc.line(MARGIN, y + 6, pageW - MARGIN, y + 6);
  return y + 22;
}

function setText(doc: jsPDF, c: RGB) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function setDraw(doc: jsPDF, c: RGB) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

/* jsPDF's built-in Helvetica is WinAnsi-encoded and has no rupee glyph, so the
   currency is spelled out. The page itself still uses ₹. */
function rupees(n: number): string {
  return "Rs. " + Math.round(n).toLocaleString("en-IN");
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function filename(e: Estimate): string {
  const who = (e.customer.company || e.customer.name).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `DGB-India-NAS-Estimate-${who || e.ref}.pdf`;
}

/** Loads the logo once, downscaled and with its baked-in white margin trimmed.
 *  The source is ~1774×887 and ~830 KB — far more than a letterhead needs. A
 *  missing or unreadable logo isn't an error: the header falls back to the
 *  company name, so an estimate can always be produced. */
async function loadLogo(): Promise<Logo | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("logo failed to load"));
      el.src = LOGO_URL;
    });

    const scale = Math.min(1, 900 / img.naturalWidth);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const full = document.createElement("canvas");
    full.width = w;
    full.height = h;
    const fctx = full.getContext("2d");
    if (!fctx) return null;
    fctx.fillStyle = "#ffffff";
    fctx.fillRect(0, 0, w, h);
    fctx.drawImage(img, 0, 0, w, h);

    const px = fctx.getImageData(0, 0, w, h).data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const i = (yy * w + xx) * 4;
        if (px[i] < 230 || px[i + 1] < 230 || px[i + 2] < 230) {
          if (xx < minX) minX = xx;
          if (xx > maxX) maxX = xx;
          if (yy < minY) minY = yy;
          if (yy > maxY) maxY = yy;
        }
      }
    }
    if (maxX < 0) return null;

    const pad = 4;
    const cx = Math.max(0, minX - pad);
    const cy = Math.max(0, minY - pad);
    const cw = Math.min(w, maxX + pad + 1) - cx;
    const ch = Math.min(h, maxY + pad + 1) - cy;

    const crop = document.createElement("canvas");
    crop.width = cw;
    crop.height = ch;
    const cctx = crop.getContext("2d");
    if (!cctx) return null;
    cctx.fillStyle = "#ffffff";
    cctx.fillRect(0, 0, cw, ch);
    cctx.drawImage(full, cx, cy, cw, ch, 0, 0, cw, ch);

    return { data: crop.toDataURL("image/jpeg", 0.92), w: cw, h: ch };
  } catch {
    return null;
  }
}
