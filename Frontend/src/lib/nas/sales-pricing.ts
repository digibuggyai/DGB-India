import "server-only";
import type { Catalogue } from "./cms-types";
import type { HddPricing, NasPricing, RaidLevel } from "./types";

/* The price list as the sales team sees it: the shape the configurator already
 * reads, with the internal floor price alongside every quote.
 *
 * This is the deliberate counterpart to normalisePricing, which exists to strip
 * exactly these figures out. It must never be reached from a public route — it
 * is used only by /api/admin/nas/pricing, behind a staff check, and the
 * catalogue passed in must have been loaded with a staff token, since the CMS
 * withholds minimums from anyone else.
 */
export function toSalesPricing(c: Catalogue): NasPricing {
  const hddPricing: HddPricing = {};
  for (const d of c.drives) {
    if (!d.active) continue;
    (hddPricing[d.capacityTb] ??= {})[d.line] = { quote: d.quotePrice, min: d.minPrice ?? null };
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
        min: m.minPrice ?? null,
        raid: (m.raid ?? []) as RaidLevel[],
        expandable: Boolean(m.expandable),
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
    install: { quote: c.settings.installQuote ?? 0, min: c.settings.installMin ?? null },
    amcRate: {
      quote: (c.settings.amcQuotePercent ?? 0) / 100,
      min: c.settings.amcMinPercent == null ? null : c.settings.amcMinPercent / 100,
    },
    upgrades: c.upgrades
      .filter((u) => u.active)
      .map((u) => ({
        sku: u.sku,
        category: u.category.toUpperCase(),
        name: u.name,
        brand: u.brand ?? "",
        spec: u.spec ?? "",
        quote: u.quotePrice,
        min: u.minPrice ?? null,
      })),
  };
}
