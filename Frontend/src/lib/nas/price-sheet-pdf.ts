import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { loadLogo } from "./pdf";
import { priceSheetFilename, type Cell, type Section } from "./price-sheet";

/* The internal NAS price sheet as a PDF: every item with its quote, its floor
 * and the margin between them. Landscape, because the unit table is wide.
 *
 * Marked INTERNAL on every page — unlike the customer estimate in pdf.ts, this
 * one deliberately carries floor prices. Loaded on demand, so jsPDF only
 * arrives when someone asks for a download. */

type RGB = [number, number, number];
const ACCENT: RGB = [128, 32, 44];
const TINT: RGB = [236, 220, 223];
const INK: RGB = [16, 21, 28];
const MUTED: RGB = [92, 97, 102];
const MARGIN = 36;

type WithTable = jsPDF & { lastAutoTable?: { finalY: number } };

export async function downloadPriceSheetPdf(sections: Section[], companyName = "DGB India"): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" }) as WithTable;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const logo = await loadLogo();
  let y = header(doc, pageW, companyName, logo);

  for (const section of sections) {
    y = renderSection(doc, section, pageW, pageH, y);
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    footer(doc, pageW, pageH, p, pages);
  }

  doc.save(priceSheetFilename("pdf"));
}

function header(doc: WithTable, pageW: number, companyName: string, logo: Awaited<ReturnType<typeof loadLogo>>): number {
  const top = 30;
  const slotH = 34;

  if (logo) {
    const scale = Math.min(slotH / logo.h, 150 / logo.w);
    doc.addImage(logo.data, "JPEG", MARGIN, top, logo.w * scale, logo.h * scale);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...INK);
    doc.text(companyName, MARGIN, top + 20);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("NAS PRICE SHEET", pageW - MARGIN, top + 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
    pageW - MARGIN,
    top + 26,
    { align: "right" },
  );

  const ruleY = top + slotH + 10;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, ruleY, pageW - MARGIN, ruleY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT);
  doc.text("INTERNAL — CONTAINS FLOOR PRICES. NOT FOR CUSTOMERS.", MARGIN, ruleY + 14);

  return ruleY + 28;
}

/** Prices as figures, text as text. Column headings carry the ₹, so the cells
 *  stay clean numbers that line up. */
function cell(v: Cell): string {
  if (v == null) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString("en-IN") : v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return v;
}

function renderSection(doc: WithTable, section: Section, pageW: number, pageH: number, y: number): number {
  if (y > pageH - 120) {
    doc.addPage();
    y = MARGIN + 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(section.title, MARGIN, y);
  y += 8;

  if (!section.rows.length) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(section.note ?? "(none)", MARGIN, y + 12);
    return y + 32;
  }

  // Numbers right-aligned: the money columns are the point of the sheet.
  const numeric = new Set<number>();
  section.columns.forEach((c, i) => {
    if (/\(₹\)|\(%\)|\(TB\)|Bays/.test(c)) numeric.add(i);
  });

  autoTable(doc, {
    startY: y + 6,
    margin: { left: MARGIN, right: MARGIN },
    head: [section.columns],
    body: section.rows.map((r) => r.map(cell)),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 4, textColor: INK, lineColor: [229, 232, 234], lineWidth: 0.5 },
    headStyles: { fillColor: TINT, textColor: ACCENT, fontStyle: "bold", fontSize: 7.5 },
    columnStyles: Object.fromEntries([...numeric].map((i) => [i, { halign: "right" as const }])),
    theme: "grid",
  });

  return (doc.lastAutoTable?.finalY ?? y) + 26;
}

function footer(doc: WithTable, pageW: number, pageH: number, page: number, pages: number): void {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("DGB India · internal price sheet", MARGIN, pageH - 20);
  doc.text(`Page ${page} of ${pages}`, pageW - MARGIN, pageH - 20, { align: "right" });
}
