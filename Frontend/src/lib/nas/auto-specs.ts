import "server-only";

export type Lookup = {
  fields: Record<string, unknown>;
  source: string | null;
  filled: string[];
  notes: string[];
};

const MAX_DRIVE_TB: Record<string, number> = { synology: 24, qnap: 32 };

function raidForBays(bays: number): string[] {
  if (bays < 2) return [];
  if (bays === 2) return ["RAID0", "RAID1"];
  if (bays === 3) return ["RAID0", "RAID1", "RAID5"];
  return ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"];
}

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

export function readSpecPairs(input: string): [string, string][] {
  const pairs: [string, string][] = [];

  const rows = input.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  for (const rowHtml of rows) {
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => clean(m[1])).filter(Boolean);
    if (cells.length >= 2) pairs.push([cells[cells.length - 2], cells[cells.length - 1]]);
  }

  if (pairs.length) return pairs;

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
    if (next && lines[i].length <= 60 && !/[.!?]$/.test(lines[i]) && !/^\d/.test(lines[i])) {
      pairs.push([lines[i], next]);
      i++;
    }
  }
  return pairs;
}

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

function readNetwork(pairs: [string, string][]): { network: string; networkUpgrade: string } {
  const ports: string[] = [];
  const upgrades: string[] = [];
  for (const [raw, value] of pairs) {
    const label = labelKey(raw);
    const speed = label.match(/(\d+(?:\.\d+)?)\s*(?:gbe|gigabit|gbps)/i);
    if (!speed || !/port|lan|ethernet/i.test(label)) continue;
    const count = num(value);
    if (count === 0) continue;
    const text = `${speed[1]}GbE${count && count > 1 ? ` ×${count}` : ""}`;
    if (/optional|expansion|pcie|add-on/i.test(`${label} ${value}`)) upgrades.push(text);
    else if (count != null) ports.push(text);
  }
  return { network: [...new Set(ports)].join(", "), networkUpgrade: [...new Set(upgrades)].join(", ") };
}

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
    return html.length > 5000 ? html : null;
  } catch {
    return null;
  }
}

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
  const brand = brandRules.find(([re]) => re.test(sku ?? "") || re.test(text))?.[1];
  if (brand) {
    fields.brand = brand;
    filled.push("Brand");
  }

  if (fields.category === "RAM" && !fields.spec) notes.push("Put the size and type in the name — “8 GB DDR4 ECC SODIMM” — and it fills itself in.");
  notes.push("Our team confirms the upgrade fits the unit before it ships; this only fills the price list.");

  return { fields, source: null, filled, notes };
}
