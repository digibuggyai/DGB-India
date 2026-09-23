import "server-only";
import {
  RAID_OPTIONS,
  type Catalogue,
  type CmsDrive,
  type CmsLog,
  type CmsDriveLine,
  type CmsModel,
  type CmsSettings,
  type CmsUpgrade,
  type Kind,
} from "./cms-types";

/* Server-side access to the NAS price list in the DGB CMS.
 *
 * Anonymous reads (the public configurator) get quote prices only — the CMS
 * hides every minimum from requests without an admin session. Admin reads and
 * writes pass the signed-in admin's own CMS token, so the CMS enforces admin
 * rights itself as well. */

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const COLLECTION: Record<Kind, string> = {
  models: "nas-models",
  drives: "nas-drives",
  upgrades: "nas-upgrades",
  driveLines: "nas-drive-lines",
};

export const PRICING_TAG = "nas-pricing";

export class CmsError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Options = { token?: string | null; method?: string; body?: unknown };

function errorMessage(data: unknown, status: number): string {
  const d = data as {
    errors?: { message?: string; data?: { errors?: { message?: string; path?: string }[] } }[];
    error?: string;
  };
  const field = d.errors?.[0]?.data?.errors?.[0];
  if (field?.message) return field.path ? `${field.path}: ${field.message}` : field.message;
  return d.errors?.[0]?.message || d.error || `The CMS returned an error (${status}).`;
}

async function cms<T>(path: string, { token, method = "GET", body }: Options = {}): Promise<T> {
  // Anonymous reads are cached and tagged, so a saved price can clear them at once.
  const cacheable = !token && method === "GET";
  const res = await fetch(`${API}/api${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(cacheable ? { next: { revalidate: 300, tags: [PRICING_TAG] } } : { cache: "no-store" as const }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new CmsError(errorMessage(data, res.status), res.status);
  return data as T;
}

export async function loadCatalogue(token?: string | null): Promise<Catalogue> {
  const [models, drives, driveLines, upgrades, settings, logs] = await Promise.all([
    cms<{ docs: CmsModel[] }>("/nas-models?limit=500&depth=0&sort=bays", { token }),
    cms<{ docs: CmsDrive[] }>("/nas-drives?limit=500&depth=0&sort=capacityTb", { token }),
    // Specifications only — nothing is priced from them. If this collection
    // isn't there yet (a CMS deploy lagging behind this one), the configurator
    // still quotes; the drive step just shows no ⓘ.
    cms<{ docs: CmsDriveLine[] }>("/nas-drive-lines?limit=100&depth=0&sort=sortOrder", { token }).catch(() => ({ docs: [] as CmsDriveLine[] })),
    cms<{ docs: CmsUpgrade[] }>("/nas-upgrades?limit=500&depth=0&sort=name", { token }),
    cms<CmsSettings>("/globals/nas-settings?depth=0", { token }),
    // The change log is admin-only; public reads skip it.
    token
      ? cms<{ docs: CmsLog[] }>("/nas-price-logs?limit=300&depth=0&sort=-createdAt", { token })
      : Promise.resolve({ docs: [] as CmsLog[] }),
  ]);
  return { models: models.docs, drives: drives.docs, driveLines: driveLines.docs, upgrades: upgrades.docs, settings, logs: logs.docs };
}

export function createRecord(token: string, kind: Kind, data: Record<string, unknown>) {
  return cms(`/${COLLECTION[kind]}`, { token, method: "POST", body: data });
}

export function updateRecord(token: string, kind: Kind, id: number, data: Record<string, unknown>) {
  return cms(`/${COLLECTION[kind]}/${id}`, { token, method: "PATCH", body: data });
}

export function deleteRecord(token: string, kind: Kind, id: number) {
  return cms(`/${COLLECTION[kind]}/${id}`, { token, method: "DELETE" });
}

export function updateSettings(token: string, data: Record<string, unknown>) {
  return cms("/globals/nas-settings", { token, method: "POST", body: data });
}

/** Drive-line specifications, in the shape both configurators read. There are
 *  no prices here, so public and sales payloads share it unchanged. Lines with
 *  nothing priced against them are kept: the drive step only lists the lines it
 *  has prices for, and the specs are ready the day one is stocked. */
export function driveLinesFrom(c: Catalogue) {
  return c.driveLines.map((l) => ({
    name: l.name,
    brand: l.brand,
    driveClass: l.driveClass,
    madeForBrand: l.madeForBrand ?? "",
    series: l.series ?? "",
    rpm: l.rpm ?? "",
    cache: l.cache ?? "",
    interface: l.interface ?? "",
    recording: l.recording ?? "",
    workloadTbYear: l.workloadTbYear ?? "",
    mtbf: l.mtbf ?? "",
    warrantyYears: l.warrantyYears ?? null,
    bestFor: l.bestFor ?? "",
    extras: l.extras ?? "",
    specsUrl: l.specsUrl ?? "",
  }));
}

/** Shapes the catalogue into the input the configurator's normaliser reads.
 *  Only active items, and no minimum field is copied — even when this is fed
 *  an admin read that contains them. */
export function toPricingInput(c: Catalogue) {
  const hddPricing: Record<number, Record<string, { quote: number }>> = {};
  for (const d of c.drives) {
    if (!d.active) continue;
    (hddPricing[d.capacityTb] ??= {})[d.line] = { quote: d.quotePrice };
  }

  return {
    updatedAt: null,
    models: c.models
      .filter((m) => m.active)
      .map((m) => ({
        id: m.model,
        brand: m.brand,
        bays: m.bays,
        quote: m.quotePrice,
        raid: m.raid,
        expandable: m.expandable,
        network: m.network ?? "",
        networkUpgrade: m.networkUpgrade ?? "",
        cpu: m.cpu ?? "",
        cpuCores: m.cpuCores ?? "",
        memory: m.memory ?? "",
        memoryMax: m.memoryMax ?? "",
        m2Slots: m.m2Slots ?? null,
        maxDriveTb: m.maxDriveTb ?? null,
        baysWithExpansion: m.baysWithExpansion ?? null,
        maxRawTb: m.maxRawTb ?? null,
        usbPorts: m.usbPorts ?? "",
        dimensions: m.dimensions ?? "",
        weightKg: m.weightKg ?? null,
        warranty: m.warranty ?? "",
        specsUrl: m.specsUrl ?? "",
      })),
    capacities: Object.keys(hddPricing)
      .map(Number)
      .sort((a, b) => a - b),
    hddPricing,
    driveLines: driveLinesFrom(c),
    install: { quote: c.settings.installQuote },
    amcRate: { quote: c.settings.amcQuotePercent == null ? null : c.settings.amcQuotePercent / 100 },
    upgrades: c.upgrades
      .filter((u) => u.active)
      .map((u) => ({ sku: u.sku, category: u.category, name: u.name, brand: u.brand ?? "", spec: u.spec ?? "", quote: u.quotePrice })),
  };
}

/* ---------------- admin input ---------------- */

const str = (v: unknown) => String(v ?? "").trim();
const num = (v: unknown) => {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const optionalNum = (v: unknown) => (v === "" || v == null ? null : num(v));
const raidList = (v: unknown) =>
  Array.isArray(v) ? RAID_OPTIONS.filter((r) => v.map(String).includes(r)) : [];

const FIELDS: Record<Kind, Record<string, (v: unknown) => unknown>> = {
  models: {
    model: str,
    brand: str,
    bays: num,
    raid: raidList,
    expandable: Boolean,
    network: str,
    networkUpgrade: str,
    cpu: str,
    cpuCores: str,
    memory: str,
    memoryMax: str,
    m2Slots: optionalNum,
    maxDriveTb: optionalNum,
    baysWithExpansion: optionalNum,
    maxRawTb: optionalNum,
    usbPorts: str,
    dimensions: str,
    weightKg: optionalNum,
    warranty: str,
    specsUrl: str,
    quotePrice: num,
    minPrice: optionalNum,
    active: Boolean,
  },
  drives: { capacityTb: num, line: str, quotePrice: num, minPrice: optionalNum, active: Boolean },
  // Specifications only — a drive line carries no price of its own.
  driveLines: {
    name: str,
    brand: str,
    driveClass: (v) => (str(v) === "enterprise" ? "enterprise" : "nas"),
    madeForBrand: str,
    series: str,
    rpm: str,
    cache: str,
    interface: str,
    recording: str,
    workloadTbYear: str,
    mtbf: str,
    warrantyYears: optionalNum,
    bestFor: str,
    extras: str,
    specsUrl: str,
    sortOrder: optionalNum,
  },
  upgrades: {
    sku: str,
    category: (v) => str(v).toUpperCase(),
    name: str,
    brand: str,
    spec: str,
    quotePrice: num,
    minPrice: optionalNum,
    active: Boolean,
  },
};

/** Keeps only the fields that belong to this kind of item, coerced to the right type. */
export function sanitize(kind: Kind, body: unknown): Record<string, unknown> {
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, coerce] of Object.entries(FIELDS[kind])) {
    if (!(key in src)) continue;
    const value = coerce(src[key]);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

export function sanitizeSettings(body: unknown): Record<string, unknown> {
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if ("installQuote" in src) out.installQuote = num(src.installQuote);
  if ("installMin" in src) out.installMin = optionalNum(src.installMin);
  if ("amcQuotePercent" in src) out.amcQuotePercent = num(src.amcQuotePercent);
  if ("amcMinPercent" in src) out.amcMinPercent = optionalNum(src.amcMinPercent);
  return out;
}

export const isKind = (v: string): v is Kind => v in COLLECTION;
