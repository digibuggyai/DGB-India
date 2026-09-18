"use client";

import { Fragment, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import {
  RAID_OPTIONS,
  type Catalogue,
  type CmsDrive,
  type CmsLog,
  type CmsModel,
  type CmsUpgrade,
  type Kind,
} from "@/lib/nas/cms-types";

/* Admin editor for the NAS configurator's price list: add, update and remove
 * units, drives and upgrades, and set installation and AMC. Minimum prices are
 * visible here only — the public configurator never receives them. */

type Rec = Record<string, unknown> & { id?: number };

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "checkbox" | "raid" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: number;
  placeholder?: string;
  wide?: boolean;
};

const FIELDS: Record<Kind | "settings", FieldDef[]> = {
  models: [
    { key: "model", label: "Model", type: "text", required: true, placeholder: "DS925+" },
    { key: "brand", label: "Brand", type: "text", required: true, placeholder: "Synology" },
    { key: "bays", label: "Bays", type: "number", required: true, step: 1 },
    { key: "quotePrice", label: "Quote price (₹, incl. GST)", type: "number", required: true, step: 100 },
    { key: "minPrice", label: "With-tax minimum (₹)", type: "number", step: 100 },
    { key: "network", label: "Network ports", type: "text", placeholder: "2.5GbE ×2" },
    { key: "networkUpgrade", label: "Network upgrade", type: "text", placeholder: "10GbE via PCIe card", wide: true },
    { key: "raid", label: "RAID levels", type: "raid", required: true, wide: true },
    { key: "expandable", label: "Expandable", type: "checkbox" },
    { key: "active", label: "Active in configurator", type: "checkbox" },
    // Shown on the configurator's specifications card. Optional — blanks are
    // left out there rather than shown as gaps.
    { key: "cpu", label: "Processor", type: "text", placeholder: "AMD Ryzen V1500B" },
    { key: "cpuCores", label: "Cores", type: "text", placeholder: "4 cores / 8 threads, 2.2 GHz" },
    { key: "memory", label: "Memory", type: "text", placeholder: "4 GB DDR4 ECC" },
    { key: "memoryMax", label: "Maximum memory", type: "text", placeholder: "32 GB" },
    { key: "m2Slots", label: "M.2 NVMe slots", type: "number", step: 1 },
    { key: "maxDriveTb", label: "Largest drive (TB)", type: "number", step: 1 },
    { key: "baysWithExpansion", label: "Bays with expansion", type: "number", step: 1 },
    { key: "maxRawTb", label: "Max raw capacity (TB)", type: "number", step: 1 },
    { key: "usbPorts", label: "USB ports", type: "text", placeholder: "2 × USB 3.2 Gen 1" },
    { key: "dimensions", label: "Dimensions (mm)", type: "text", placeholder: "166 × 199 × 223 mm" },
    { key: "weightKg", label: "Weight (kg)", type: "number", step: 0.01 },
    { key: "warranty", label: "Warranty", type: "text", placeholder: "3 years, extendable to 5" },
    { key: "specsUrl", label: "Manufacturer spec page (https)", type: "text", placeholder: "https://…", wide: true },
  ],
  drives: [
    { key: "capacityTb", label: "Capacity (TB)", type: "number", required: true, step: 1 },
    { key: "line", label: "Drive line", type: "text", required: true, placeholder: "IronWolf" },
    { key: "quotePrice", label: "Quote price (₹, incl. GST)", type: "number", required: true, step: 100 },
    { key: "minPrice", label: "With-tax minimum (₹)", type: "number", step: 100 },
    { key: "active", label: "Active in configurator", type: "checkbox" },
  ],
  upgrades: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "8 GB DDR4 RAM" },
    {
      key: "category",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "RAM", label: "RAM" },
        { value: "NIC", label: "Network card" },
      ],
    },
    { key: "sku", label: "SKU", type: "text", required: true },
    { key: "brand", label: "Brand", type: "text" },
    { key: "spec", label: "Spec", type: "text", placeholder: "10GbE", wide: true },
    { key: "quotePrice", label: "Quote price (₹, incl. GST)", type: "number", required: true, step: 100 },
    { key: "minPrice", label: "With-tax minimum (₹)", type: "number", step: 100 },
    { key: "active", label: "Active in configurator", type: "checkbox" },
  ],
  settings: [
    { key: "installQuote", label: "Installation quote (₹ per unit)", type: "number", required: true, step: 100 },
    { key: "installMin", label: "Installation minimum (₹ per unit)", type: "number", step: 100 },
    { key: "amcQuotePercent", label: "AMC quote (% of hardware)", type: "number", required: true, step: 0.5 },
    { key: "amcMinPercent", label: "AMC minimum (% of hardware)", type: "number", step: 0.5 },
  ],
};

const NEW_ITEM: Record<Kind, Rec> = {
  models: { raid: ["RAID0", "RAID1"], expandable: false, active: true },
  drives: { active: true },
  upgrades: { category: "RAM", active: true },
};

const inr = (v: unknown) => (typeof v === "number" ? "₹" + Math.round(v).toLocaleString("en-IN") : "—");
const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground/80";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`/api/admin/nas${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "The request failed.");
  return data;
}

type Tab = Kind | "settings" | "log";

export function PricingManager({ initial }: { initial: Catalogue }) {
  const [catalogue, setCatalogue] = useState(initial);
  const [tab, setTab] = useState<Tab>("models");
  const [notice, setNotice] = useState<string | null>(null);

  async function changed(message: string) {
    setCatalogue((await api("")) as unknown as Catalogue);
    setNotice(message);
    window.setTimeout(() => setNotice(null), 4000);
  }

  const models = useMemo(() => [...catalogue.models].sort((a, b) => a.bays - b.bays || a.quotePrice - b.quotePrice), [catalogue.models]);
  const drives = useMemo(() => [...catalogue.drives].sort((a, b) => a.capacityTb - b.capacityTb || a.line.localeCompare(b.line)), [catalogue.drives]);
  const upgrades = useMemo(
    () => [...catalogue.upgrades].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
    [catalogue.upgrades],
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "models", label: "NAS models", count: models.length },
    { id: "drives", label: "Hard drives", count: drives.length },
    { id: "upgrades", label: "RAM & network cards", count: upgrades.length },
    { id: "settings", label: "Installation & AMC" },
    { id: "log", label: "Change log", count: catalogue.logs.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
            }`}
          >
            {t.label}
            {t.count != null ? <span className="ml-1.5 opacity-70">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {notice ? (
        <p role="status" className="rounded-md border border-[#cbe7d3] bg-[#e6f4ea] px-4 py-2.5 text-sm text-[#1e4d2b]">
          {notice}
        </p>
      ) : null}

      <p className="text-sm text-muted">
        The quote price is what customers see. The with-tax minimum is for your team only and is never sent to the public
        site. To hide an item without deleting it, untick <b className="font-semibold text-foreground">Active</b>.
      </p>

      {tab === "models" ? (
        <KindSection
          kind="models"
          title="NAS models"
          addLabel="Add model"
          rows={models as unknown as Rec[]}
          onChanged={changed}
          describe={(r) => String(r.model)}
          columns={[
            {
              label: "Model",
              render: (r) => {
                const m = r as unknown as CmsModel;
                return (
                  <>
                    <span className="block font-semibold text-foreground">{m.model}</span>
                    <span className="block text-xs text-muted">
                      {m.brand}
                      {m.expandable ? " · expandable" : ""}
                    </span>
                  </>
                );
              },
            },
            { label: "Bays", render: (r) => `${r.bays}-bay` },
            { label: "RAID", render: (r) => ((r.raid as string[]) ?? []).map((x) => x.replace("RAID", "")).join(" / ") },
            { label: "Network", render: (r) => <span className="text-muted">{String(r.network || "—")}</span> },
            { label: "Quote", align: "right", render: (r) => <span className="font-semibold text-foreground">{inr(r.quotePrice)}</span> },
            { label: "Minimum", align: "right", render: (r) => <span className="text-muted">{inr(r.minPrice)}</span> },
            { label: "Status", render: (r) => <ActivePill active={Boolean(r.active)} /> },
          ]}
        />
      ) : null}

      {tab === "drives" ? (
        <KindSection
          kind="drives"
          title="Hard drives"
          addLabel="Add drive"
          rows={drives as unknown as Rec[]}
          onChanged={changed}
          describe={(r) => `${r.capacityTb} TB ${r.line}`}
          columns={[
            {
              label: "Drive",
              render: (r) => {
                const d = r as unknown as CmsDrive;
                return <span className="font-semibold text-foreground">{`${d.capacityTb} TB ${d.line}`}</span>;
              },
            },
            { label: "Quote (each)", align: "right", render: (r) => <span className="font-semibold text-foreground">{inr(r.quotePrice)}</span> },
            { label: "Minimum (each)", align: "right", render: (r) => <span className="text-muted">{inr(r.minPrice)}</span> },
            { label: "Status", render: (r) => <ActivePill active={Boolean(r.active)} /> },
          ]}
        />
      ) : null}

      {tab === "upgrades" ? (
        <KindSection
          kind="upgrades"
          title="RAM & network cards"
          addLabel="Add upgrade"
          rows={upgrades as unknown as Rec[]}
          onChanged={changed}
          describe={(r) => String(r.name)}
          emptyText="Nothing yet. Add a RAM kit or network card and it appears as an optional upgrade in the configurator."
          columns={[
            {
              label: "Upgrade",
              render: (r) => {
                const u = r as unknown as CmsUpgrade;
                return (
                  <>
                    <span className="block font-semibold text-foreground">{u.name}</span>
                    <span className="block text-xs text-muted">{[u.sku, u.brand].filter(Boolean).join(" · ")}</span>
                  </>
                );
              },
            },
            { label: "Type", render: (r) => (r.category === "NIC" ? "Network card" : "RAM") },
            { label: "Spec", render: (r) => <span className="text-muted">{String(r.spec || "—")}</span> },
            { label: "Quote", align: "right", render: (r) => <span className="font-semibold text-foreground">{inr(r.quotePrice)}</span> },
            { label: "Minimum", align: "right", render: (r) => <span className="text-muted">{inr(r.minPrice)}</span> },
            { label: "Status", render: (r) => <ActivePill active={Boolean(r.active)} /> },
          ]}
        />
      ) : null}

      {tab === "settings" ? (
        <section className="overflow-hidden rounded-lg border border-border bg-background">
          <h2 className="font-display border-b border-border bg-surface px-5 py-3 text-sm font-bold tracking-tight">Installation & AMC</h2>
          <div className="p-5">
            <RecordForm
              fields={FIELDS.settings}
              initial={catalogue.settings as unknown as Rec}
              submitLabel="Save"
              onSubmit={async (values) => {
                await api("/settings", "PATCH", values);
                await changed("Installation & AMC saved — the configurator now uses them.");
              }}
            />
          </div>
        </section>
      ) : null}

      {tab === "log" ? <ChangeLog logs={catalogue.logs} /> : null}
    </div>
  );
}

type Column = { label: string; align?: "right"; render: (r: Rec) => ReactNode };

function KindSection({
  kind,
  title,
  addLabel,
  rows,
  columns,
  onChanged,
  describe,
  emptyText = "Nothing here yet.",
}: {
  kind: Kind;
  title: string;
  addLabel: string;
  rows: Rec[];
  columns: Column[];
  onChanged: (message: string) => Promise<void>;
  describe: (r: Rec) => string;
  emptyText?: string;
}) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(r: Rec) {
    const name = describe(r);
    if (!window.confirm(`Remove ${name}?\n\nIt disappears from the configurator and can't be undone. To hide it for now, untick Active instead.`)) {
      return;
    }
    setRemovingId(r.id ?? null);
    setError(null);
    try {
      await api(`/${kind}/${r.id}`, "DELETE");
      await onChanged(`Removed ${name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove it.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
        <h2 className="font-display text-sm font-bold tracking-tight">
          {title} <span className="font-normal text-muted">· {rows.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setEditing(editing === "new" ? null : "new")}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          {editing === "new" ? "Close" : `+ ${addLabel}`}
        </button>
      </div>

      {editing === "new" ? (
        <div className="border-b border-border bg-tint/40 p-4 sm:p-5">
          <RecordForm
            fields={FIELDS[kind]}
            initial={NEW_ITEM[kind]}
            submitLabel={addLabel}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await api(`/${kind}`, "POST", values);
              setEditing(null);
              await onChanged(`Added ${describe(values)} — it's live in the configurator.`);
            }}
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="border-b border-border bg-tint px-5 py-2.5 text-sm text-tint-foreground">
          {error}
        </p>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-muted">
                {columns.map((c) => (
                  <th key={c.label} className={`px-4 py-2.5 font-semibold first:pl-5 ${c.align === "right" ? "text-right" : ""}`}>
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className={`border-b border-border last:border-0 ${r.active ? "" : "opacity-60"} ${editing === r.id ? "bg-tint/40" : ""}`}>
                    {columns.map((c) => (
                      <td key={c.label} className={`px-4 py-3 align-top tabular-nums first:pl-5 ${c.align === "right" ? "text-right" : ""}`}>
                        {c.render(r)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-5 py-3 text-right align-top">
                      <button
                        type="button"
                        onClick={() => setEditing(editing === r.id ? null : (r.id ?? null))}
                        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                      >
                        {editing === r.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        disabled={removingId === r.id}
                        className="ml-2 rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-tint disabled:opacity-50"
                      >
                        {removingId === r.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                  {editing === r.id ? (
                    <tr className="border-b border-border bg-tint/40">
                      <td colSpan={columns.length + 1} className="px-5 pb-5 pt-1">
                        <RecordForm
                          fields={FIELDS[kind]}
                          initial={r}
                          submitLabel="Save changes"
                          onCancel={() => setEditing(null)}
                          onSubmit={async (values) => {
                            await api(`/${kind}/${r.id}`, "PATCH", values);
                            setEditing(null);
                            await onChanged(`Saved ${describe(values)} — the configurator now uses it.`);
                          }}
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-muted">{emptyText}</p>
      )}
    </section>
  );
}

function RecordForm({
  fields,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  fields: FieldDef[];
  initial: Rec;
  submitLabel: string;
  onSubmit: (values: Rec) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<Rec>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: unknown) => setValues((prev) => ({ ...prev, [key]: value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = fields
      .filter((f) => {
        if (!f.required) return false;
        const v = values[f.key];
        return f.type === "raid" ? !Array.isArray(v) || v.length === 0 : v === "" || v == null;
      })
      .map((f) => f.label);
    if (missing.length) {
      setError(`Fill in: ${missing.join(", ")}.`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-lg border border-border-strong bg-background p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <FieldInput key={f.key} def={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-border-strong bg-tint px-3 py-2 text-sm text-tint-foreground">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? <Spinner className="h-4 w-4" /> : null}
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-muted hover:text-foreground">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const wrap = def.wide ? "sm:col-span-2" : "";
  const required = def.required ? <span className="text-accent"> *</span> : null;

  if (def.type === "checkbox") {
    return (
      <label className={`flex items-center gap-2 self-end pb-2 text-sm text-foreground ${wrap}`}>
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#80202c]" />
        {def.label}
      </label>
    );
  }

  if (def.type === "raid") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <fieldset className={wrap}>
        <legend className={labelClass}>
          {def.label}
          {required}
        </legend>
        <div className="flex flex-wrap gap-2">
          {RAID_OPTIONS.map((r) => {
            const on = selected.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(RAID_OPTIONS.filter((x) => (x === r ? !on : selected.includes(x))))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:border-accent"
                }`}
              >
                {r.replace("RAID", "RAID ")}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (def.type === "select") {
    return (
      <label className={`block ${wrap}`}>
        <span className={labelClass}>
          {def.label}
          {required}
        </span>
        <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className={`block ${wrap}`}>
      <span className={labelClass}>
        {def.label}
        {required}
      </span>
      <input
        type={def.type}
        step={def.step}
        min={def.type === "number" ? 0 : undefined}
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={def.placeholder}
        className={`${inputClass} ${def.type === "number" ? "tabular-nums" : ""}`}
      />
    </label>
  );
}

/* ---------------- change log ---------------- */

const LOG_FIELD_LABELS: Record<string, string> = {
  model: "Model",
  brand: "Brand",
  bays: "Bays",
  raid: "RAID",
  expandable: "Expandable",
  network: "Network ports",
  networkUpgrade: "Network upgrade",
  quotePrice: "Quote price",
  minPrice: "Minimum",
  active: "Active",
  capacityTb: "Capacity (TB)",
  line: "Drive line",
  sku: "SKU",
  category: "Type",
  name: "Name",
  spec: "Spec",
  installQuote: "Installation quote",
  installMin: "Installation minimum",
  amcQuotePercent: "AMC quote",
  amcMinPercent: "AMC minimum",
};

const ITEM_TYPE_LABELS: Record<CmsLog["itemType"], string> = {
  model: "NAS model",
  drive: "Hard drive",
  upgrade: "Upgrade",
  settings: "Installation & AMC",
};

const ACTION_STYLES: Record<CmsLog["action"], { label: string; className: string }> = {
  created: { label: "Added", className: "border-[#cbe7d3] bg-[#e6f4ea] text-[#1e4d2b]" },
  updated: { label: "Updated", className: "border-border-strong bg-surface text-foreground" },
  deleted: { label: "Removed", className: "border-border-strong bg-tint text-tint-foreground" },
};

// Fixed time zone so the server render and the browser agree.
const logTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function logValue(field: string, v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  if (/Price$|^install/.test(field) && typeof v === "number") return inr(v);
  if (/Percent$/.test(field)) return `${v}%`;
  return String(v);
}

function ChangeLog({ logs }: { logs: CmsLog[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [l.userEmail, l.userName, l.itemLabel, ITEM_TYPE_LABELS[l.itemType]].some((s) => s?.toLowerCase().includes(q)),
    );
  }, [logs, query]);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
        <h2 className="font-display text-sm font-bold tracking-tight">
          Change log <span className="font-normal text-muted">· latest {logs.length}</span>
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by email or item"
          aria-label="Filter the change log"
          className={`${inputClass} max-w-xs`}
        />
      </div>

      {shown.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-widest text-muted">
                <th className="py-2.5 pl-5 pr-4 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Changed by</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="px-4 py-2.5 font-semibold">Item</th>
                <th className="py-2.5 pl-4 pr-5 font-semibold">Changes</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => {
                const action = ACTION_STYLES[l.action];
                return (
                  <tr key={l.id} className="border-b border-border align-top last:border-0">
                    <td className="whitespace-nowrap py-3 pl-5 pr-4 tabular-nums text-muted">{logTime.format(new Date(l.createdAt))}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${l.userEmail}`} className="font-medium text-foreground hover:text-accent">
                        {l.userEmail}
                      </a>
                      {l.userName ? <span className="block text-xs text-muted">{l.userName}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${action.className}`}>{action.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-foreground">{l.itemLabel}</span>
                      <span className="block text-xs text-muted">{ITEM_TYPE_LABELS[l.itemType]}</span>
                    </td>
                    <td className="py-3 pl-4 pr-5">
                      <ul className="space-y-0.5 text-xs leading-relaxed">
                        {(l.changes ?? []).map((c) => (
                          <li key={c.field}>
                            <span className="text-muted">{LOG_FIELD_LABELS[c.field] ?? c.field}: </span>
                            {l.action === "created" ? (
                              <span className="text-foreground">{logValue(c.field, c.to)}</span>
                            ) : l.action === "deleted" ? (
                              <span className="text-muted line-through">{logValue(c.field, c.from)}</span>
                            ) : (
                              <>
                                <span className="text-muted line-through">{logValue(c.field, c.from)}</span>
                                <span className="text-muted"> → </span>
                                <span className="font-semibold text-foreground">{logValue(c.field, c.to)}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-muted">
          {logs.length ? "No changes match that filter." : "No changes yet. Every add, edit and removal made from now on is recorded here."}
        </p>
      )}
    </section>
  );
}

function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        active ? "border-[#cbe7d3] bg-[#e6f4ea] text-[#1e4d2b]" : "border-border bg-surface text-muted"
      }`}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}
