import "server-only";

/* Filling in a new item's specifications by itself, so adding a NAS model or a
 * RAM kit to the price list isn't twenty fields of typing.
 *
 * Three sources, in order of how much they can be trusted:
 *
 *   1. The manufacturer's own spec page, fetched and parsed. Synology serves
 *      its spec table in the HTML, so a model name is enough. QNAP answers
 *      server-side requests with a bot challenge and no content, so there is
 *      nothing to parse — for those, the admin pastes the spec sheet and the
 *      same parser reads it.
 *   2. Rules that hold for the whole brand, like the largest drive a unit
 *      accepts. These need no network and are applied either way.
 *   3. The item's own name, for RAM and network cards, where "8 GB DDR4 ECC"
 *      says everything the price list records.
 *
 * Nothing here saves anything: it proposes values, the admin sees what was
 * filled and from where, and what it can't determine it leaves blank rather
 * than guessing. These figures end up in front of customers. */

export type Lookup = {
  /** Proposed values, keyed as the price list's fields are. */
  fields: Record<string, unknown>;
  /** The page they came from, if any. */
  source: string | null;
  /** Labels of what was filled, for the admin to read back. */
  filled: string[];
  /** Anything the admin should check or supply by hand. */
  notes: string[];
};

/* ---------------- brand rules ---------------- */

/* The largest drive each brand's units accept. Synology's current DiskStations
 * top out at 24 TB per bay and QNAP's at 32 TB; the configurator never quotes
 * anything larger, so a new model inherits its brand's ceiling. */
const MAX_DRIVE_TB: Record<string, number> = { synology: 24, qnap: 32 };

/** RAID levels a chassis with this many bays can actually run. */
function raidForBays(bays: number): string[] {
  if (bays < 2) return [];
  if (bays === 2) return ["RAID0", "RAID1"];
  if (bays === 3) return ["RAID0", "RAID1", "RAID5"];
  return ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"];
}

/* ---------------- reading a spec sheet ---------------- */

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
  "&times;": "×", "&ndash;": "–", "&mdash;": "—", "&deg;": "°",
};

const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();

/** Label/value pairs out of an HTML spec table, or out of pasted text. */
export function readSpecPairs(input: string): [string, string][] {
  const pairs: [string, string][] = [];

  // Synology and QNAP both lay their specs out as table rows.
  const rows = input.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  for (const rowHtml of rows) {
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => clean(m[1])).filter(Boolean);
    // The label is the last cell before the value — a row may lead with a
    // section heading cell ("CPU") that spans several rows beneath it.
    if (cells.length >= 2) pairs.push([cells[cells.length - 2], cells[cells.length - 1]]);
  }

  if (pairs.length) return pairs;

  // Pasted text: "Label: value", "Label<tab>value", or a label line followed
  // by its value on the next line.
  const lines = input
    .split(/\r?\n/)
    .map((l) => clean(l))
    .filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const inline = lines[i].match(/^([^:\t]{2,60})[:\t]\s*(.+)$/);
    if (inline) {
      pairs.push([inline[1].trim(), inline[2].trim()]);
      continue;
    }
    const next = lines[i + 1];
    // A label is short and doesn't end in a full stop; a value follows it.
    if (next && lines[i].length <= 60 && !/[.!?]$/.test(lines[i]) && !/^\d/.test(lines[i])) {
      pairs.push([lines[i], next]);
      i++;
    }
  }
  return pairs;
}

/* A spec-sheet label as written, reduced to what it actually names. Makers
 * hang footnotes and links off their labels — Synology's is "Drive Bays (See
 * all supported drives)" — and those would stop every label from matching. */
const labelKey = (s: string) =>
  s
    .replace(/\([^)]*\)?/g, " ")
    .replace(/[*†‡]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const num = (v: string): number | null => {
  const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

/* Which spec-sheet label feeds which field. Both makers are covered: Synology
 * writes "Drive Bays" and "Size (Height x Width x Depth)", QNAP writes "Drive
 * Bay" and "Dimensions". */
const FIELD_LABELS: { key: string; label: string; match: RegExp; take?: (v: string) => unknown }[] = [
  { key: "cpu", label: "Processor", match: /^(cpu|processor)( model| name)?$/i },
  { key: "memory", label: "Memory", match: /^((system|pre-installed|installed) )?memory$/i },
  { key: "memoryMax", label: "Maximum memory", match: /^(maximum|max\.?) (memory|ram)/i },
  { key: "bays", label: "Bays", match: /^(number of )?drive bays?$|^(hdd|drive) bays?$/i, take: num },
  { key: "baysWithExpansion", label: "Bays with expansion", match: /maximum (number of )?drive bays? with expansion/i, take: num },
  { key: "m2Slots", label: "M.2 slots", match: /^m\.?2 (drive |ssd |nvme )?slots?$/i, take: num },
  { key: "usbPorts", label: "USB ports", match: /usb.*ports?$/i },
  { key: "dimensions", label: "Dimensions", match: /^(size|dimensions)$/i },
  { key: "weightKg", label: "Weight", match: /^weight$/i, take: num },
  { key: "warranty", label: "Warranty", match: /^warranty$/i },
];

/** Network ports, which both makers spread over one label per port type. */
function readNetwork(pairs: [string, string][]): { network: string; networkUpgrade: string } {
  const ports: string[] = [];
  const upgrades: string[] = [];
  for (const [raw, value] of pairs) {
    const label = labelKey(raw);
    const speed = label.match(/(\d+(?:\.\d+)?)\s*(?:gbe|gigabit|gbps)/i);
    if (!speed || !/port|lan|ethernet/i.test(label)) continue;
    const count = num(value);
    // "0" means the unit doesn't have that port type at all.
    if (count === 0) continue;
    const text = `${speed[1]}GbE${count && count > 1 ? ` ×${count}` : ""}`;
    if (/optional|expansion|pcie|add-on/i.test(`${label} ${value}`)) upgrades.push(text);
    else if (count != null) ports.push(text);
  }
  return { network: [...new Set(ports)].join(", "), networkUpgrade: [...new Set(upgrades)].join(", ") };
}

/** Turns a spec sheet — fetched or pasted — into price-list fields. */
export function fieldsFromSpecSheet(input: string, brand: string): { fields: Record<string, unknown>; filled: string[] } {
  const pairs = readSpecPairs(input);
  const fields: Record<string, unknown> = {};
  const filled: string[] = [];

  for (const def of FIELD_LABELS) {
    const hit = pairs.find(([label, value]) => def.match.test(labelKey(label)) && value && value !== "-");
    if (!hit) continue;
    const value = def.take ? def.take(hit[1]) : hit[1];
    if (value == null || value === "") continue;
    fields[def.key] = value;
    filled.push(def.label);
  }

  // Cores, threads and clock speed read as one line on the specifications card.
  const cpuBits = [
    pairs.find(([l]) => /^cpu (core|cores)$/i.test(labelKey(l)))?.[1],
    pairs.find(([l]) => /^cpu thread/i.test(labelKey(l)))?.[1],
    pairs.find(([l]) => /^cpu (frequency|speed|clock)/i.test(labelKey(l)))?.[1],
  ];
  if (cpuBits.some(Boolean)) {
    const cores = cpuBits[0] ? `${cpuBits[0]} cores` : "";
    const threads = cpuBits[1] ? `${cpuBits[1]} threads` : "";
    const clock = cpuBits[2] ?? "";
    fields.cpuCores = [[cores, threads].filter(Boolean).join(" / "), clock].filter(Boolean).join(", ");
    filled.push("Cores");
  }

  // Synology doesn't give M.2 slots a row of their own — the count sits in the
  // drive-bay cell, as "2 × M.2 2280 NVMe SSD" under the SATA bays.
  if (fields.m2Slots == null) {
    for (const [, value] of pairs) {
      const m = value.match(/(\d+)\s*[×x]\s*M\.?2\b/i);
      if (m) {
        fields.m2Slots = Number(m[1]);
        filled.push("M.2 slots");
        break;
      }
    }
  }

  const net = readNetwork(pairs);
  if (net.network) {
    fields.network = net.network;
    filled.push("Network ports");
  }
  if (net.networkUpgrade) {
    fields.networkUpgrade = net.networkUpgrade;
    filled.push("Network upgrade");
  }

  if (brand) fields.brand = brand;
  return { fields, filled };
}

/* ---------------- rules that always apply ---------------- */

/** What can be worked out without a spec sheet: the brand's drive ceiling, the
 *  RAID levels the bay count allows, and whether an expansion unit is on. */
export function applyRules(fields: Record<string, unknown>, brand: string): { fields: Record<string, unknown>; filled: string[] } {
  const out = { ...fields };
  const filled: string[] = [];
  const bays = Number(out.bays);
  const perDrive = MAX_DRIVE_TB[brand.trim().toLowerCase()];

  if (perDrive && out.maxDriveTb == null) {
    out.maxDriveTb = perDrive;
    filled.push("Largest drive");
    if (Number.isFinite(bays) && bays > 0) {
      out.maxRawTb = bays * perDrive;
      filled.push("Max raw capacity");
    }
  }

  const expansion = Number(out.baysWithExpansion);
  if (Number.isFinite(expansion) && Number.isFinite(bays)) {
    out.expandable = expansion > bays;
    filled.push("Expandable");
  }

  if (Number.isFinite(bays) && bays > 0 && !(Array.isArray(out.raid) && out.raid.length)) {
    const raid = raidForBays(bays);
    if (raid.length) {
      out.raid = raid;
      filled.push("RAID levels");
    }
  }

  return { fields: out, filled };
}

/* ---------------- the manufacturer's page ---------------- */

/* Only these hosts are ever fetched. The model name arrives from a form, so
 * without an allow-list this would happily fetch anything an admin typed —
 * including an address inside our own network. */
const ALLOWED_HOSTS = ["www.synology.com", "synology.com"];

export function specPageUrl(brand: string, model: string): string | null {
  const name = model.trim();
  if (!name) return null;
  if (brand.trim().toLowerCase() === "synology") return `https://www.synology.com/en-global/products/${name}`;
  return null;
}

async function fetchPage(url: string): Promise<string | null> {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  if (!ALLOWED_HOSTS.includes(host)) return null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DGBIndia-PriceList/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();
    // A challenge page or a "not found" both come back far too short to hold a
    // spec table; treating one as specs would fill the form with nonsense.
    return html.length > 5000 ? html : null;
  } catch {
    return null;
  }
}

/* ---------------- NAS models ---------------- */

export async function lookupModel({ model, brand, text }: { model: string; brand: string; text?: string }): Promise<Lookup> {
  const notes: string[] = [];
  let source: string | null = null;
  let sheet = (text ?? "").trim();

  if (!sheet) {
    const url = specPageUrl(brand, model);
    if (url) {
      const html = await fetchPage(url);
      if (html) sheet = html;
      else notes.push(`Couldn't read ${url} — check the model name is spelt as ${brand} writes it, or paste the spec sheet below.`);
      if (html) source = url;
    } else {
      notes.push(
        `${brand || "This brand"} doesn't serve its specifications to us — its site answers automated requests with a challenge page. Open the model's spec page, copy the specifications and paste them below; they're read the same way.`,
      );
    }
  }

  let read = sheet ? fieldsFromSpecSheet(sheet, brand) : { fields: {} as Record<string, unknown>, filled: [] };

  /* A wrong model name doesn't 404 — Synology answers with a marketing page,
   * and odd rows on it do parse into something. Filling the form with another
   * unit's figures is worse than filling nothing, so unless the processor or
   * the bay count came through, this wasn't the unit's spec sheet and
   * everything read from it is dropped. */
  if (read.filled.length && !read.fields.cpu && read.fields.bays == null) {
    read = { fields: {}, filled: [] };
    notes.push(
      source
        ? `That page doesn't carry ${model}'s specifications — check the model name is spelt as ${brand} writes it, or paste the spec sheet below.`
        : "That doesn't look like a specifications table — paste the specifications themselves, not the whole page.",
    );
    source = null;
  }

  const ruled = applyRules(read.fields, brand);

  if (sheet && !read.filled.length && !notes.length) {
    // A page came back but held no specifications — a "not found" page, most
    // likely. Recording its address as the spec link would be wrong.
    if (source) {
      notes.push(`${source} didn't look like a spec sheet — check the model name is spelt as ${brand} writes it, or paste the specifications below.`);
      source = null;
    } else {
      notes.push("Nothing recognisable in that spec sheet — check it's the specifications table rather than the whole page.");
    }
  }
  if (ruled.fields.bays == null) notes.push("Bay count not found — fill it in by hand, since the price and the RAID levels depend on it.");
  if (source) notes.push("Check the figures against the page before saving — a maker can reword its spec sheet at any time.");

  return {
    fields: { ...ruled.fields, ...(source ? { specsUrl: source } : {}) },
    source,
    filled: [...read.filled, ...ruled.filled, ...(source ? ["Spec page link"] : [])],
    notes,
  };
}

/* ---------------- RAM and network cards ---------------- */

const RAM_BRANDS: [RegExp, string][] = [
  [/\bd4(es|eu|ec|ne|nes)/i, "Synology"],
  [/\bram-?\d+gdr|qnap/i, "QNAP"],
  [/kingston/i, "Kingston"],
  [/crucial/i, "Crucial"],
];

const NIC_BRANDS: [RegExp, string][] = [
  [/\be(10|25)g\d|synology/i, "Synology"],
  [/\b(qxg|qm2)-|qnap/i, "QNAP"],
  [/intel/i, "Intel"],
];

/* An upgrade's own name carries everything the price list records about it, so
 * this needs no network at all: "D4ES01-8G 8 GB DDR4 ECC" is a Synology RAM
 * kit of 8 GB DDR4 ECC, and "QXG-10G1T" is a 10GbE card with one port. */
export function lookupUpgrade({ name, sku }: { name: string; sku?: string }): Lookup {
  const text = `${name} ${sku ?? ""}`.trim();
  const fields: Record<string, unknown> = {};
  const filled: string[] = [];
  const notes: string[] = [];

  const isNic = /\b(\d+(?:\.\d+)?)\s*gbe\b|10g|25g|\bnic\b|network (card|adapter)|ethernet (card|adapter)/i.test(text);
  const isRam = /\bddr\d?\b|sodimm|dimm|\bram\b|memory/i.test(text);

  if (isNic && !isRam) {
    fields.category = "NIC";
    const speed = text.match(/(\d+(?:\.\d+)?)\s*gbe|\b(10|25|40)g\b/i);
    const ports = text.match(/(\d)\s*[-\s]?ports?|(?:^|[^a-z])([12])t\b/i);
    const spec = [speed ? `${speed[1] ?? speed[2]}GbE` : "", ports ? `×${ports[1] ?? ports[2]}` : ""].filter(Boolean).join(" ");
    if (spec) {
      fields.spec = spec;
      filled.push("Spec");
    }
    filled.push("Type");
  } else if (isRam) {
    fields.category = "RAM";
    const size = text.match(/(\d+)\s*GB/i);
    const type = text.match(/DDR\d(?:L)?(?:-\d+)?/i);
    const ecc = /\becc\b/i.test(text);
    const form = /sodimm/i.test(text) ? "SODIMM" : "";
    const spec = [size ? `${size[1]} GB` : "", type ? type[0].toUpperCase() : "", ecc ? "ECC" : "", form].filter(Boolean).join(" ");
    if (spec) {
      fields.spec = spec;
      filled.push("Spec");
    }
    filled.push("Type");
  } else {
    notes.push("Couldn't tell whether this is RAM or a network card from its name — pick the type by hand.");
  }

  const brandRules = fields.category === "NIC" ? NIC_BRANDS : RAM_BRANDS;
  // The SKU names the maker more reliably than the description does.
  const brand = brandRules.find(([re]) => re.test(sku ?? "") || re.test(text))?.[1];
  if (brand) {
    fields.brand = brand;
    filled.push("Brand");
  }

  if (fields.category === "RAM" && !fields.spec) notes.push("Put the size and type in the name — “8 GB DDR4 ECC SODIMM” — and it fills itself in.");
  notes.push("Our team confirms the upgrade fits the unit before it ships; this only fills the price list.");

  return { fields, source: null, filled, notes };
}
