import "server-only";
import type { HddPricing, NasModel, NasPricing, RaidLevel, Upgrade } from "./types";

/* Turns the DigiBuggy pricing service's response into the shape the
 * configurator reads.
 *
 * Every object is rebuilt field by field, never spread from the upstream
 * payload. That is the point of this file. /api/pricing/public already omits the
 * minimum price, but if this proxy were ever pointed at the internal
 * /api/pricing by mistake, a `min` or `minTax` would still not be copied across
 * — there is no line here that reads one.
 *
 * Unlike the sales tool, there is no built-in fallback price list: that snapshot
 * carries real minimums in client code, and a public page shouldn't quote stale
 * figures anyway. Unusable data is reported as a failure instead. */

const RAID_LEVELS = new Set<string>(["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"]);

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const toStr = (v: unknown): string => String(v ?? "").trim();

export type NormaliseResult = { ok: true; pricing: NasPricing } | { ok: false; reason: string };

export function normalisePricing(raw: unknown): NormaliseResult {
  const d: Obj = isObj(raw) ? raw : {};

  const models: NasModel[] = (Array.isArray(d.models) ? d.models : [])
    .filter(isObj)
    .map((m) => ({
      id: toStr(m.id),
      brand: toStr(m.brand),
      bays: Number(m.bays),
      quote: Number(m.quote),
      raid: (Array.isArray(m.raid) ? m.raid : []).filter((r): r is RaidLevel => RAID_LEVELS.has(String(r))),
      expandable: Boolean(m.expandable),
      network: toStr(m.network),
      networkUpgrade: toStr(m.networkUpgrade),
    }))
    .filter((m) => m.id && m.raid.length && Number.isFinite(m.bays) && Number.isFinite(m.quote));

  const hddPricing: HddPricing = {};
  const src: Obj = isObj(d.hddPricing) ? d.hddPricing : {};
  for (const capKey of Object.keys(src)) {
    const linesRaw = src[capKey];
    const lines: Obj = isObj(linesRaw) ? linesRaw : {};
    const entry: Record<string, { quote: number }> = {};
    for (const line of Object.keys(lines)) {
      const priceRaw = lines[line];
      const quote = Number(isObj(priceRaw) ? priceRaw.quote : NaN);
      if (Number.isFinite(quote) && quote > 0) entry[line] = { quote };
    }
    if (Object.keys(entry).length) hddPricing[Number(capKey)] = entry;
  }

  const capacities = (
    Array.isArray(d.capacities) && d.capacities.length ? d.capacities.map(Number) : Object.keys(hddPricing).map(Number)
  )
    .filter((c) => Number.isFinite(c) && hddPricing[c])
    .sort((a, b) => a - b);

  const install = { quote: Number(isObj(d.install) ? d.install.quote : NaN) };

  // `rmaRate` is what the field was called before it was renamed to AMC.
  const amcRaw: Obj = isObj(d.amcRate) ? d.amcRate : isObj(d.rmaRate) ? d.rmaRate : {};
  const amcRate = { quote: Number(amcRaw.quote) };

  const upgrades: Upgrade[] = (Array.isArray(d.upgrades) ? d.upgrades : [])
    .filter(isObj)
    .map((u) => ({
      sku: toStr(u.sku),
      category: toStr(u.category).toUpperCase(),
      name: toStr(u.name),
      brand: toStr(u.brand),
      spec: toStr(u.spec),
      quote: Number(u.quote),
    }))
    .filter((u) => u.sku && u.name && Number.isFinite(u.quote));

  if (!models.length) return { ok: false, reason: "no usable models" };
  if (!capacities.length) return { ok: false, reason: "no drive capacities priced" };
  if (!Number.isFinite(install.quote)) return { ok: false, reason: "installation price missing" };
  if (!(amcRate.quote >= 0 && amcRate.quote < 1)) return { ok: false, reason: "AMC rate out of range" };

  return {
    ok: true,
    pricing: {
      updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : null,
      models,
      capacities,
      hddPricing,
      install,
      amcRate,
      upgrades,
    },
  };
}
