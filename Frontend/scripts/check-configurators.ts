import fs from "fs";
import { toSalesPricing } from "@/lib/nas/sales-pricing";
import { normalisePricing } from "@/lib/nas/normalise";
import type { Catalogue } from "@/lib/nas/cms-types";

const catalogue = JSON.parse(fs.readFileSync(process.argv[2], "utf8")) as Catalogue;

let passed = 0;
const failures: string[] = [];
const check = (name: string, fn: () => void) => {
  try {
    fn();
    passed++;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
  }
};
const assert = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(msg);
};

const sales = toSalesPricing(catalogue);

const publicResult = normalisePricing(JSON.parse(JSON.stringify(sales)));
assert(publicResult.ok, "the public payload failed to normalise");
const customer = publicResult.ok ? publicResult.pricing : null!;

check("every active chassis carries a floor for sales", () => {
  const missing = sales.models.filter((m) => m.min == null).map((m) => m.id);
  assert(!missing.length, `no floor on: ${missing.join(", ")}`);
});

check("every active drive carries a floor for sales", () => {
  const missing: string[] = [];
  for (const [tb, lines] of Object.entries(sales.hddPricing)) {
    for (const [line, price] of Object.entries(lines)) {
      if (price.min == null) missing.push(`${tb} TB ${line}`);
    }
  }
  assert(!missing.length, `no floor on: ${missing.join(", ")}`);
});

check("installation and AMC carry floors for sales", () => {
  assert(sales.install.min != null, "installation has no floor");
  assert(sales.amcRate.min != null, "AMC has no floor");
});

check("every floor sits below its own quote", () => {
  const bad: string[] = [];
  for (const m of sales.models) if (m.min != null && m.min >= m.quote) bad.push(m.id);
  for (const [tb, lines] of Object.entries(sales.hddPricing)) {
    for (const [line, p] of Object.entries(lines)) {
      if (p.min != null && p.min >= p.quote) bad.push(`${tb} TB ${line}`);
    }
  }
  if (sales.install.min != null && sales.install.min >= sales.install.quote) bad.push("installation");
  assert(!bad.length, `floor not below quote: ${bad.join(", ")}`);
});

check("the customer payload contains no floor anywhere", () => {
  const found: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (/^(min|minPrice|floor|installMin|amcMin)$/i.test(k) && v != null) found.push(`${path}.${k} = ${v}`);
        walk(v, `${path}.${k}`);
      }
    }
  };
  walk(customer, "pricing");
  assert(!found.length, `floors leaked to the customer: ${found.join(", ")}`);
});

check("no floor value appears in the customer payload, under any key", () => {
  const floors = new Set<number>();
  for (const m of sales.models) if (m.min != null) floors.add(m.min);
  for (const lines of Object.values(sales.hddPricing)) {
    for (const p of Object.values(lines)) if (p.min != null) floors.add(p.min);
  }
  const json = JSON.stringify(customer);
  const leaked = [...floors].filter((f) => {
    const isAlsoAQuote =
      sales.models.some((m) => m.quote === f) ||
      Object.values(sales.hddPricing).some((lines) => Object.values(lines).some((p) => p.quote === f));
    return !isAlsoAQuote && new RegExp(`\\b${f}\\b`).test(json);
  });
  assert(!leaked.length, `floor values found in the customer payload: ${leaked.join(", ")}`);
});

const activeModels = catalogue.models.filter((m) => m.active);
const activeDrives = catalogue.drives.filter((d) => d.active);

check("sales quotes match the database", () => {
  for (const m of activeModels) {
    const got = sales.models.find((s) => s.id === m.model);
    assert(got?.quote === m.quotePrice, `${m.model}: sales quote ${got?.quote} ≠ ${m.quotePrice}`);
    assert(got?.min === m.minPrice, `${m.model}: sales floor ${got?.min} ≠ ${m.minPrice}`);
  }
});

check("customer quotes match the database", () => {
  for (const m of activeModels) {
    const got = customer.models.find((s) => s.id === m.model);
    assert(got?.quote === m.quotePrice, `${m.model}: customer quote ${got?.quote} ≠ ${m.quotePrice}`);
  }
  for (const d of activeDrives) {
    const got = customer.hddPricing[d.capacityTb]?.[d.line];
    assert(got?.quote === d.quotePrice, `${d.capacityTb} TB ${d.line}: customer quote ${got?.quote} ≠ ${d.quotePrice}`);
  }
});

check("both screens offer exactly the same catalogue", () => {
  const salesIds = sales.models.map((m) => m.id).sort();
  const custIds = customer.models.map((m) => m.id).sort();
  assert(JSON.stringify(salesIds) === JSON.stringify(custIds), "the two screens list different chassis");
  assert(
    JSON.stringify(sales.capacities) === JSON.stringify(customer.capacities),
    "the two screens offer different capacities",
  );
});

check("switched-off rows reach neither screen", () => {
  const off = catalogue.drives.filter((d) => !d.active);
  assert(off.length > 0, "expected at least one switched-off drive to test with");
  for (const d of off) {
    assert(!sales.hddPricing[d.capacityTb]?.[d.line], `${d.capacityTb} TB ${d.line} is off but reached sales`);
    assert(!customer.hddPricing[d.capacityTb]?.[d.line], `${d.capacityTb} TB ${d.line} is off but reached customers`);
  }
});

console.log(`${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAIL ${f}`);

if (!failures.length) {
  const floors = sales.models.filter((m) => m.min != null).length;
  console.log(`\nSales screen: ${sales.models.length} chassis, all with floors (${floors}).`);
  console.log(`Customer screen: ${customer.models.length} chassis, ${customer.capacities.length} capacities, no floors.`);
}
process.exit(failures.length ? 1 : 0);
