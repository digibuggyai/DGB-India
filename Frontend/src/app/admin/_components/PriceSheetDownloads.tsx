"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import type { Catalogue } from "@/lib/nas/cms-types";

/* Download the internal price sheet. Sits with the page title rather than the
 * tabs: it covers the whole price list, not whichever tab is open. */

export function PriceSheetDownloads({ catalogue }: { catalogue: Catalogue }) {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The sheet builder and jsPDF are fetched only when one is asked for.
  async function download(kind: "csv" | "pdf") {
    setBusy(kind);
    setError(null);
    try {
      const { buildPriceSheet, toCsv, priceSheetFilename, downloadFile } = await import("@/lib/nas/price-sheet");
      const sections = buildPriceSheet(catalogue);
      if (kind === "csv") {
        downloadFile(toCsv(sections), priceSheetFilename("csv"), "text/csv;charset=utf-8");
      } else {
        const { downloadPriceSheetPdf } = await import("@/lib/nas/price-sheet-pdf");
        await downloadPriceSheetPdf(sections);
      }
    } catch (err) {
      console.error("[price-sheet]", err);
      setError("Couldn't build the price sheet. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  const style =
    "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-60";

  return (
    <div className="sm:text-right">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Price sheet</p>
      <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
        <button type="button" onClick={() => download("csv")} disabled={busy !== null} className={style}>
          {busy === "csv" ? <Spinner className="h-3.5 w-3.5" /> : null}
          {busy === "csv" ? "Preparing…" : "Excel (CSV)"}
        </button>
        <button type="button" onClick={() => download("pdf")} disabled={busy !== null} className={style}>
          {busy === "pdf" ? <Spinner className="h-3.5 w-3.5" /> : null}
          {busy === "pdf" ? "Preparing…" : "PDF"}
        </button>
      </div>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted sm:ml-auto">
        Every item with its quote, minimum and margin. Internal — don&rsquo;t send it to a customer.
      </p>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
