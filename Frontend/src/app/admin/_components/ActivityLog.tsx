"use client";

import { useMemo, useState } from "react";
import type { ActivityEntry } from "../_lib/activity";

/* The activity log.
 *
 * It answers one question quickly: what happened to this thing, and who did it?
 * Deletions lead, because they're the only action that leaves nothing behind to
 * inspect afterwards — when eleven enquiries disappear, this is the only place
 * that can say when and by whom. */

const ACTION = {
  created: { label: "Added", className: "border-[#cbe7d3] bg-[#e6f4ea] text-[#1e4d2b]" },
  updated: { label: "Edited", className: "border-border bg-surface text-muted" },
  deleted: { label: "Deleted", className: "border-border-strong bg-tint text-tint-foreground" },
} as const;

const TYPE_LABEL: Record<string, string> = {
  model: "NAS model",
  drive: "Hard drive",
  driveLine: "Drive specs",
  upgrade: "Upgrade",
  settings: "Installation & AMC",
  post: "Blog post",
  lead: "Enquiry",
  media: "Image",
  user: "Account",
  offerCode: "Offer code",
};

const when = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
};

/** A changed value, short enough to sit in a table. */
function value(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.length ? v.map((x) => value(x)).join(", ") : "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
  const s = String(v);
  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
}

export function ActivityLog({ initial }: { initial: ActivityEntry[] }) {
  const [action, setAction] = useState<"all" | keyof typeof ACTION>("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const types = useMemo(() => [...new Set(initial.map((e) => e.itemType))].sort(), [initial]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.filter(
      (e) =>
        (action === "all" || e.action === action) &&
        (type === "all" || e.itemType === type) &&
        (!q ||
          e.itemLabel.toLowerCase().includes(q) ||
          e.userEmail.toLowerCase().includes(q) ||
          (e.changes ?? []).some((c) => c.field.toLowerCase().includes(q))),
    );
  }, [initial, action, type, query]);

  const counts = useMemo(() => {
    const c = { created: 0, updated: 0, deleted: 0 };
    for (const e of initial) c[e.action]++;
    return c;
  }, [initial]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "deleted", "created", "updated"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAction(a)}
            aria-pressed={action === a}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              action === a
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {a === "all" ? "Everything" : ACTION[a].label}
            <span className="ml-1.5 opacity-70">{a === "all" ? initial.length : counts[a]}</span>
          </button>
        ))}

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by what changed"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="all">Everything</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t] ?? t}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search an item, a person or a field"
          aria-label="Search the log"
          className="max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-background">
        {shown.length ? (
          <ul className="divide-y divide-border">
            {shown.map((e) => {
              const changes = e.changes ?? [];
              const expanded = open === e.id;
              return (
                <li key={e.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ACTION[e.action].className}`}>
                      {ACTION[e.action].label}
                    </span>
                    <span className="text-xs uppercase tracking-[0.12em] text-muted">{TYPE_LABEL[e.itemType] ?? e.itemType}</span>
                    <span className="font-medium text-foreground">{e.itemLabel}</span>
                    {e.itemId ? <span className="text-xs text-muted">#{e.itemId}</span> : null}
                    <span className="ml-auto whitespace-nowrap text-xs text-muted">{when(e.createdAt)}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    <span>
                      by <span className="text-foreground/80">{e.userName || e.userEmail}</span>
                      {e.userName ? ` (${e.userEmail})` : ""}
                    </span>
                    {changes.length ? (
                      <button
                        type="button"
                        onClick={() => setOpen(expanded ? null : e.id)}
                        className="font-medium text-accent underline-offset-2 hover:underline"
                      >
                        {expanded ? "Hide" : `${changes.length} field${changes.length === 1 ? "" : "s"}`}
                      </button>
                    ) : null}
                  </div>

                  {expanded ? (
                    <div className="mt-2 overflow-x-auto rounded-md border border-border bg-surface">
                      <table className="w-full min-w-[520px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-muted">
                            <th className="px-3 py-2 font-semibold">Field</th>
                            <th className="px-3 py-2 font-semibold">Was</th>
                            <th className="px-3 py-2 font-semibold">Became</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map((c) => (
                            <tr key={c.field} className="border-b border-border last:border-0">
                              <td className="px-3 py-1.5 font-medium text-foreground">{c.field}</td>
                              <td className="px-3 py-1.5 text-muted">{value(c.from)}</td>
                              <td className="px-3 py-1.5 text-foreground">{value(c.to)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted">
            {initial.length ? "Nothing matches that." : "Nothing recorded yet. Changes appear here as they're made."}
          </p>
        )}
      </section>
    </div>
  );
}
