"use client";

import { useMemo, useState } from "react";
import type { OfferCode } from "../_lib/offer-codes";

/* The discount codes the configurator has issued, and what's become of them.
 *
 * The job this does on a sales call is: someone reads out a code, and you need
 * to know within seconds whether it's real, whose it is, what they were
 * pricing, and whether it's already been spent. So the search matches the code
 * and the customer, and marking one used is one click. */

type Status = OfferCode["status"];

const STATUS: Record<Status, { label: string; className: string }> = {
  issued: { label: "Outstanding", className: "border-[#cbe7d3] bg-[#e6f4ea] text-[#1e4d2b]" },
  used: { label: "Used", className: "border-border bg-surface text-muted" },
  void: { label: "Void", className: "border-border-strong bg-tint text-tint-foreground" },
};

const inr = (v: number | null | undefined) => (typeof v === "number" ? "₹" + Math.round(v).toLocaleString("en-IN") : "—");

const day = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export function OfferCodesManager({ initial }: { initial: OfferCode[] }) {
  const [codes, setCodes] = useState(initial);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q ||
          c.code.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q)),
    );
  }, [codes, filter, query]);

  async function setStatus(code: OfferCode, status: Status) {
    setBusyId(code.id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/admin/offer-codes/${code.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; doc?: OfferCode };
      if (!res.ok) throw new Error(data.error || "Couldn't update that code.");
      setCodes((prev) => prev.map((c) => (c.id === code.id ? { ...c, status, usedAt: status === "used" ? new Date().toISOString() : null } : c)));
      setNotice(
        status === "used"
          ? `${code.code} marked used — it can't be redeemed again.`
          : status === "void"
            ? `${code.code} voided.`
            : `${code.code} is outstanding again.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update that code.");
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    const c = { issued: 0, used: 0, void: 0 };
    for (const row of codes) c[row.status]++;
    return c;
  }, [codes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "issued", "used", "void"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {f === "all" ? "All" : STATUS[f].label}
            <span className="ml-1.5 opacity-70">{f === "all" ? codes.length : counts[f]}</span>
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a code, name or email"
          aria-label="Search codes"
          className="max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      {notice ? (
        <p role="status" className="rounded-md border border-[#cbe7d3] bg-[#e6f4ea] px-4 py-2.5 text-sm text-[#1e4d2b]">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-md border border-border-strong bg-tint px-4 py-2.5 text-sm text-tint-foreground">
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        {shown.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-2.5 font-semibold">Code</th>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-4 py-2.5 font-semibold">Issued</th>
                  <th className="px-4 py-2.5 font-semibold">Worth up to</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id} className={`border-b border-border last:border-0 ${c.status === "issued" ? "" : "opacity-70"}`}>
                    <td className="px-5 py-3 align-top">
                      <span className="font-display font-bold tracking-tight text-foreground">{c.code}</span>
                      {c.configuration ? (
                        <span className="mt-1 block max-w-md text-xs leading-relaxed text-muted">{c.configuration}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block font-medium text-foreground">{c.customerName}</span>
                      <span className="block text-xs text-muted">{c.company || "—"}</span>
                      <a href={`mailto:${c.email}`} className="block text-xs text-accent underline-offset-2 hover:underline">
                        {c.email}
                      </a>
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="block text-xs text-muted hover:text-accent">
                          {c.phone}
                        </a>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-muted">
                      {day(c.createdAt)}
                      {c.status === "used" && c.usedAt ? <span className="block text-xs">Used {day(c.usedAt)}</span> : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top tabular-nums text-foreground">{inr(c.valueMax)}</td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS[c.status].className}`}>
                        {STATUS[c.status].label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right align-top">
                      {c.status === "issued" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setStatus(c, "used")}
                            disabled={busyId === c.id}
                            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                          >
                            {busyId === c.id ? "Saving…" : "Mark used"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(c, "void")}
                            disabled={busyId === c.id}
                            className="ml-2 rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-tint disabled:opacity-50"
                          >
                            Void
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(c, "issued")}
                          disabled={busyId === c.id}
                          className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                        >
                          {busyId === c.id ? "Saving…" : "Reopen"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted">
            {codes.length ? "No codes match that." : "No codes issued yet. They appear here as customers ask for a consultation."}
          </p>
        )}
      </section>
    </div>
  );
}
