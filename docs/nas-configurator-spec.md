# NAS Configurator — product list and engine specification

Everything needed to rebuild the DGB India NAS configurator somewhere else: the
catalogue it quotes from, and the rules it quotes by. Written to be
implementable without reading the original source, though the source is
referenced throughout for anyone who wants it.

**Snapshot taken:** 25 September 2026, from the live CMS.

> **This file contains internal floor prices.** The `Min` columns are the lowest
> a salesperson may go, and they must never reach a browser. If you port this,
> keep the same split the original has: a public payload built field by field
> that has no line reading a minimum, and a separate staff-only payload that
> deliberately includes them. Delete the `Min` columns before sharing this file
> outside the company.

---

## 1. The catalogue

Four things are priced: **NAS units**, **drives** (by capacity and product line),
**upgrades** (RAM and network cards), and two **service settings** (installation
and AMC). Drive *specifications* are a fifth table, carrying no price.

### 1.1 NAS units — 15 models, all active

| Model | Brand | Bays | RAID | Network | Network upgrade | CPU | RAM | Max RAM | M.2 | Max drive TB | Bays + exp. | Warranty | **Quote ₹** | *Min ₹* |
|---|---|--:|---|---|---|---|---|---|--:|--:|--:|---|--:|--:|
| TS-233-2G | QNAP | 2 | 0/1 | 1GbE ×1 | — | ARM Cortex-A55 | 2 GB (on board) | not upgradable | 0 | 32 | — | 2 yr → 5 | **24,000** | *22,420* |
| DS223J | Synology | 2 | 0/1 | 1GbE ×1 | — | Realtek RTD1619B | 1 GB DDR4 | not upgradable | 0 | 24 | — | 2 yr → 4 | **24,000** | *22,420* |
| TS-216G-4G | QNAP | 2 | 0/1 | 2.5GbE ×1 + 1GbE ×1 | — | ARM Cortex-A55 | 4 GB | — | 0 | 32 | — | 2 yr → 5 | **29,000** | *27,730* |
| DS225+ | Synology | 2 | 0/1 | 2.5GbE ×1 + 1GbE ×1 | — | Intel Celeron J4125 | 2 GB DDR4 | 6 GB | 0 | 24 | — | 3 yr → 5 | **42,000** | *40,120* |
| DS725+ | Synology | 2 | 0/1 | 2.5GbE ×1 + 1GbE ×1 | — | AMD Ryzen R1600 | 4 GB DDR4 ECC | 32 GB | 2 | 24 | 7 | 3 yr → 5 | **94,000** | *89,680* |
| TS-433-4G | QNAP | 4 | 0/1/5/6/10 | 2.5GbE ×1 + 1GbE ×1 | — | ARM Cortex-A55 | 4 GB (on board) | not upgradable | 0 | 32 | — | — | **45,000** | *42,480* |
| TS-462-4G | QNAP | 4 | 0/1/5/6/10 | 2.5GbE ×1 | 10GbE via PCIe | Intel Celeron N4505 | 4 GB DDR4 | 16 GB | 2 | 32 | — | — | **57,000** | *54,280* |
| DS425+ | Synology | 4 | 0/1/5/6/10 | 2.5GbE ×1 + 1GbE ×1 | — | Intel Celeron J4125 | 2 GB DDR4 | 6 GB | 2 | 24 | — | 3 yr → 5 | **67,000** | *63,720* |
| TS-464-8G | QNAP | 4 | 0/1/5/6/10 | 2.5GbE ×2 | 10GbE via PCIe | Intel Celeron N5105 | 8 GB DDR4 | 16 GB | 2 | 32 | 12 | — | **69,000** | *66,080* |
| DS925+ | Synology | 4 | 0/1/5/6/10 | 2.5GbE ×2 | — | AMD Ryzen V1500B | 4 GB DDR4 ECC | 32 GB | 2 | 24 | 9 | 3 yr → 5 | **97,000** | *92,630* |
| DS1525+ | Synology | 5 | 0/1/5/6/10 | 2.5GbE ×2 | 10GbE via E10G22-T1-Mini | AMD Ryzen V1500B | 8 GB DDR4 ECC | 32 GB | 2 | 24 | 15 | 3 yr → 5 | **1,42,000** | *1,35,700* |
| TS-664-8G | QNAP | 6 | 0/1/5/6/10 | 2.5GbE ×2 | 10GbE via PCIe | Intel Celeron N5095 | 8 GB DDR4 | 16 GB | 2 | 32 | — | — | **87,000** | *82,600* |
| TS-832PX-4G | QNAP | 8 | 0/1/5/6/10 | 10GbE SFP+ ×2 + 2.5GbE ×2 | — | Annapurna Labs AL-324 | 4 GB DDR4 | 16 GB | 0 | 32 | 16 | — | **1,08,000** | *1,03,250* |
| TS-873A-8G | QNAP | 8 | 0/1/5/6/10 | 2.5GbE ×2 | 5/10GbE via PCIe Gen3 | AMD Ryzen V1500B | 8 GB DDR4 | 64 GB | 2 | 32 | 16 | — | **1,30,000** | *1,23,900* |
| DS1825+ | Synology | 8 | 0/1/5/6/10 | 2.5GbE ×2 | up to 25GbE via PCIe | AMD Ryzen V1500B | 8 GB DDR4 ECC | 32 GB | 2 | 24 | 18 | 3 yr → 5 | **1,80,000** | *1,71,100* |

Notes that matter to the engine:

- **Max drive TB** is a hard ceiling per bay: Synology units take 24 TB drives,
  QNAP 32 TB. Nothing larger is ever quoted in that chassis.
- **RAID** is the set of levels the chassis supports. A 2-bay unit lists only
  RAID 0 and 1 — it physically cannot run parity.
- **Bays + exp.** is the total once an expansion enclosure is attached; blank
  means the unit takes no expansion. `expandable` is the boolean the filter uses.
- Prices are **per unit, GST inclusive**.

### 1.2 Drives — priced combinations

4 lines are stocked: Exos, IronWolf, IronWolf Pro, WD Ultrastar. Price is **per drive, GST inclusive**.

| TB | Line | **Quote ₹** | *Min ₹* | ₹/TB (quote) |
|--:|---|--:|--:|--:|
| 2 | Exos | **21,683** | *20,650* | 10,842 |
| 2 | IronWolf | **18,957** | *18,054* | 9,479 |
| 4 | Exos | **27,510** | *26,200* | 6,878 |
| 4 | IronWolf | **22,054** | *21,004* | 5,514 |
| 6 | WD Ultrastar | **29,736** | *28,320* | 4,956 |
| 8 | Exos | **45,224** | *43,070* | 5,653 |
| 8 | IronWolf Pro | **48,321** | *46,020* | 6,040 |
| 10 | Exos | **52,038** | *49,560* | 5,204 |
| 10 | IronWolf | **49,560** | *47,200* | 4,956 |
| 10 | IronWolf Pro | **55,136** | *52,510* | 5,514 |
| 10 | WD Ultrastar | **50,180** | *47,790* | 5,018 |
| 12 | Exos | **68,145** | *64,900* | 5,679 |
| 12 | IronWolf Pro | **67,526** | *64,310* | 5,627 |
| 12 | WD Ultrastar | **67,526** | *64,310* | 5,627 |
| 16 | Exos | **83,633** | *79,650* | 5,227 |
| 16 | IronWolf Pro | **89,828** | *85,550* | 5,614 |
| 16 | WD Ultrastar | **84,872** | *80,830* | 5,305 |
| 18 | WD Ultrastar | **87,969** | *83,780* | 4,887 |
| 20 | Exos | **1,02,837** | *97,940* | 5,142 |
| 20 | IronWolf Pro | **1,06,554** | *1,01,480* | 5,328 |
| 20 | WD Ultrastar | **1,00,979** | *96,170* | 5,049 |
| 24 | WD Ultrastar | **1,18,944** | *1,13,280* | 4,956 |

Capacities available: **2, 4, 6, 8, 10, 12, 16, 18, 20, 24 TB**. Not every line exists at every capacity — that sparseness is load-bearing, see §3.6.

### 1.3 Drive line specifications — no prices

| Line | Brand | Class | Series | RPM | Cache | Recording | Workload | MTBF | Warranty | Vendor drive for |
|---|---|---|---|---|---|---|---|---|--:|---|
| IronWolf | Seagate | NAS | IronWolf | 5,400–7,200 | 64–256 MB | CMR | 180 TB/yr | 1M hr | 3 yr | — |
| IronWolf Pro | Seagate | NAS | IronWolf Pro | 7,200 | 256–512 MB | CMR | 300 TB/yr (550 at 24 TB+) | 1.2M hr (2.5M at 24 TB+) | 5 yr | — |
| Exos | Seagate | Enterprise | Exos X | 7,200 | 256–512 MB | CMR | 550 TB/yr | 2.5M hr | 5 yr | — |
| WD Ultrastar | Western Digital | Enterprise | DC HC560/HC580 | 7,200 | 512 MB | CMR | 550 TB/yr | up to 2.5M hr | 5 yr | — |
| Synology Plus | Synology | NAS | HAT3300/3310/3320 | 5,400 (2–6 TB), 7,200 (8–20 TB) | — | CMR | 180 TB/yr (up to 300) | up to 1.2M hr | 3 yr | Synology |
| Synology Enterprise | Synology | Enterprise | HAT5300/5310/5320 | 7,200 | — | CMR | 550 TB/yr | up to 2.5M hr | 5 yr | Synology |

All 6 are on record; **Exos, IronWolf, IronWolf Pro, WD Ultrastar** have prices, so only those can be quoted. Synology Plus and Synology Enterprise are specified and ready for the day they are stocked.
Interface is SATA 6 Gb/s throughout (Exos and Ultrastar also exist in SAS).

### 1.4 Upgrades

**Currently empty.** The schema supports RAM and network-card add-ons priced per
unit; none are on the list today. The engine must handle the empty case — the
upgrades step hides itself when nothing is priced.

Shape, for when they're added: `{ sku, category: "RAM" | "NIC", name, brand,
spec, quotePrice, minPrice, active }`.

### 1.5 Service settings

| | Quote | *Min* |
|---|--:|--:|
| Installation & setup, per unit | **₹5,900** | *₹4,130* |
| AMC, as % of hardware value | **10%** | *7%* |

---

## 2. Data model

Five tables. Everything the engine needs is here; nothing else is consulted at
quote time.

```
nas_models       id, model(unique), brand, bays, raid[], expandable,
                 network, networkUpgrade, cpu, cpuCores, memory, memoryMax,
                 m2Slots, maxDriveTb, baysWithExpansion, maxRawTb, usbPorts,
                 dimensions, weightKg, warranty, specsUrl,
                 quotePrice, minPrice, active

nas_drives       id, capacityTb, line, quotePrice, minPrice, active

nas_drive_lines  id, name(unique, = nas_drives.line), brand, driveClass,
                 madeForBrand, series, rpm, cache, interface, recording,
                 workloadTbYear, mtbf, warrantyYears, bestFor, extras,
                 specsUrl, sortOrder

nas_upgrades     id, sku, category, name, brand, spec,
                 quotePrice, minPrice, active

nas_settings     installQuote, installMin, amcQuotePercent, amcMinPercent   (singleton)
```

Two rules travel with this model:

1. **`active = false` hides an item from quoting without deleting it.** Every
   read filters on it.
2. **`minPrice` is field-level restricted.** In the original, the CMS refuses to
   return it to an unauthenticated request at all; the public API layer then
   rebuilds the payload field by field so that even an accidental staff read
   can't leak a floor. Two defences, deliberately.

The runtime shape the engine consumes:

```ts
type NasPricing = {
  models: NasModel[];          // id, brand, bays, quote, raid[], expandable, network, maxDriveTb, …
  capacities: number[];        // sorted, derived from hddPricing keys
  hddPricing: Record<number, Record<string, { quote: number; min?: number }>>;  // TB → line → price
  driveLines: DriveLine[];     // specs only
  upgrades: Upgrade[];
  install: { quote: number; min?: number };
  amcRate: { quote: number; min?: number };   // a fraction: 0.10 is 10%
};
```

`hddPricing` being a two-level map (capacity → line → price) is what makes the
inner search loop cheap; build it once on load.

---

## 3. The engine

Pure functions, no DOM, no I/O.

**The code itself is in `docs/reference/`** — the four files this section
describes, copied from the running site. What follows is the reasoning behind
them, which is the part that doesn't survive being read off the source. If you
only want the behaviour, take the files; if you want to reimplement in another
language, read on.

### 3.1 RAID rules

| Level | Min drives | Step | Usable from `n` drives of `c` TB |
|---|--:|--:|---|
| RAID 0 | **2** | 1 | `n × c` |
| RAID 1 | 2 | 1 | `c` (always one mirrored pair) |
| RAID 5 | 3 | 1 | `(n − 1) × c` |
| RAID 6 | 4 | 1 | `(n − 2) × c` |
| RAID 10 | 4 | **2** | `(n ÷ 2) × c` |

Two of these are easy to get wrong:

- **RAID 0 takes at least two drives.** A single drive is a plain volume, not a
  stripe. The tool this was ported from allowed one and produced quotes like
  "1 × 4 TB at RAID 0" in a 2-bay box.
- **RAID 1 is always exactly one pair**, no matter how many bays the chassis
  has. More capacity comes from more *units*, not more mirrored drives.
- **RAID 10 fills in pairs** (`step: 2`), so an odd bay count leaves one bay
  empty: a 5-bay unit runs 4 drives.

### 3.2 Drives needed for a target — `computeDrives(raid, driveTB, targetTB, maxBays)`

Returns `{ drivesPerUnit, units, totalUsable }`.

```
if maxBays < minDrives(raid)      → { 0, Infinity, 0 }     // chassis can't host this array
if raid == RAID1                  → drivesPerUnit = 2
                                     units = max(1, ceil(target / c))
for n = minDrives … maxBays step step:
    if usable(raid, n, c) >= target → { n, 1, usable }     // fits in one box
// doesn't fit in one box: fill it and gang more
fullest = (step == 2) ? maxBays − (maxBays mod 2) : maxBays
units   = ceil(target / usable(raid, fullest, c))
```

Returning `units: Infinity` rather than throwing is deliberate: every caller
filters on `units <= maxUnits`, so an impossible combination drops out of all
searches by itself.

### 3.3 Enumerating builds — `suggestBuilds`

A **build** is a complete proposal: `{ model, driveCap, driveLine, drivesPerUnit,
units, totalUsable, spareBays, totalQuote }`.

```
for each model matching the filters:
  for each capacity that fits the model's maxDriveTb:
    for each line priced at that capacity:
      calc = computeDrives(raid, cap, target, model.bays)
      skip if calc.units > MAX_UNITS (4)
      totalQuote = model.quote × units + drivePrice × (drivesPerUnit × units)
sort by: totalQuote ASC, then units ASC, then totalUsable ASC
```

The third sort key means that at equal price and box count, the build that
over-delivers least wins.

`modelMatches` applies: RAID level supported, `bays >= minDrives(raid)` (belt and
braces against bad data), brand filter, exact bay filter, expandable-only filter.

**`bestBuildPerModel`** then keeps the cheapest build per model, so the shortlist
offers genuinely different units rather than the same box five times with
different drives.

Constants: `MAX_BAYS = 8`, `MAX_UNITS = 4`, `STORAGE_MIN = 2`, `STORAGE_MAX = 200`.

### 3.4 Buildable sizes — `buildableSizes`

A NAS delivers whole drives at a RAID level, so usable capacity lands on
discrete values. Rather than let someone type a figure no combination produces,
enumerate what's reachable and offer that:

```
for each matching model, each fitting capacity, each drive count n
(RAID 1: n is always [2]; otherwise minDrives…model.bays step step):
  perUnit = usable(raid, n, cap)
  for units = 1…MAX_UNITS:
     total = perUnit × units
     keep if STORAGE_MIN <= total <= STORAGE_MAX and total is an integer
```

`nearestBuildable(target, sizes)` picks the closest offered size, **preferring
not to under-deliver** on a tie. The UI then says "showing 20 TB — 18 TB can't
be built from whole drives".

### 3.5 Sizing by budget

This is where the naive implementation goes wrong, twice.

**`suggestBuildsForBudget`** enumerates like §3.3 but bounded by money, and
sorted by **most usable capacity first**, then cheaper, then fewer boxes. Two
details:

- The budget covers **the whole quote**, not just hardware. Installation and AMC
  are passed in as `extraCost(hardware, units)` and counted before a build is
  accepted — otherwise a customer with ₹2,00,000 gets a ₹1,98,000 build plus
  ₹5,900 installation plus 10% AMC and is ₹25,700 over.
- Each extra unit only costs more, so the unit loop `break`s at the first
  overrun instead of continuing.

**`suggestBudgetPlan`** chooses the RAID level when the customer hasn't:

> Maximising capacity across all levels always lands on RAID 0 — zero fault
> tolerance — however generous the budget. So RAID 0 is excluded from the first
> pass. Among the redundant levels, take the one that turns the budget into the
> **most usable space**, ties going to the more protective level.

Trying levels most-protective-first and stopping at the first that fits sounds
safer but spends the budget badly: RAID 6 gives a second drive to parity, so at
the same money it routinely delivers far less than RAID 5 — often a third less
on the very same chassis. (§5 has the figures for the current price list; they
move whenever drive prices do, which is why they aren't quoted here.) Only
if nothing redundant is affordable does it fall back to RAID 0, and the UI then
says plainly that there's no redundancy.

**`cheapestOutlay`** exists so that an impossible budget can say what *would* be
enough — "₹50,000 doesn't cover a complete configuration; the least we can build
is ₹X" beats "nothing fits".

### 3.6 Which options to offer — `feasibleOptions`

The pickers are driven off the same build pool the recommendation comes from, so
they can't drift from the catalogue. Grey out what can't be built; never hide it.

- **Bay sizes** are computed *as if no bay size were pinned* — otherwise, once
  you pick one, every other tier looks unreachable and there's no way back.
  Only sizes the array actually **fills** are offered: a 4-bay unit holds two
  drives fine, but then 2/4/6/8-bay all read the identical "2× 2 TB" and look
  like duplicates. Where nothing fits exactly (a three-drive RAID 5 has no
  three-bay chassis), the sizes wasting the fewest bays are offered instead, so
  there's always something to pick.
- **Drive sizes** are judged against the whole pool.
- **Drive lines** are judged against the *chosen* size — a line not sold in that
  size greys out. An impossible size is ignored rather than greying out every
  line.

### 3.7 Honouring the customer's picks — `pickBuild`

```
byCap  = driveCap  ? builds.filter(cap)      : builds
capPool = byCap.length ? byCap : builds          // an impossible pin is dropped
byLine = driveLine ? capPool.filter(line)    : capPool
pool   = byLine.length ? byLine : capPool
options = bestBuildPerModel(pool)
build   = (pinned model if still in pool) ?? options[0]
```

**Size is narrowed first, then line, each falling back on its own.** Filtering on
both at once was a real bug: an impossible drive size still pinned would swallow
a perfectly good drive line, so the click registered and the recommendation
didn't move.

### 3.8 Pricing — `priceFor`

```
nas      = model.quote × units
hdd      = drivePrice × drivesPerUnit × units
ram      = ramUpgrade.quote × units          // one kit per chassis
nic      = nicUpgrade.quote × units
hardware = nas + hdd + ram + nic
install  = includeInstall ? installQuote × units : 0
amc      = includeAMC ? hardware × amcRate : 0
total    = hardware + install + amc
```

Everything is GST-inclusive; there is no separate tax line. Installation is
**per chassis**, AMC is **a percentage of hardware only** — it doesn't compound
on installation.

The parallel floor calculation uses the same shapes with `min` values, and is
**omitted entirely unless both the unit and the drive have a minimum on record**
— a partial floor is a misleading floor. Upgrades and installation fall back to
their quote price if they have no minimum (never discount what you can't).

### 3.9 Network speed

Never offered as a choice — derived and displayed. Parse every `NGbE` in the
model's port string, take the maximum, round onto quotable rungs: `≥10 → 10GbE`,
`≥2.5 → 2.5GbE`, `≥1 → 1GbE`. The `networkUpgrade` string is shown separately as
"can be upgraded to", not as a quoted speed.

### 3.10 Drive compatibility notes

Advisory only — they never block a configuration, because every combination
priced is one that runs:

| Condition | Note |
|---|---|
| Drive line's `madeForBrand` ≠ the unit's brand | Vendor drives lose their health integration in another maker's box |
| Drive line's `madeForBrand` = the unit's brand | Validated, health reported in the vendor's software |
| Unit is Synology, drive is third-party | Supported, but less health detail and support may ask you to reproduce on a validated drive |
| Workload rating < 300 TB/yr and > 8 drives in the array | Array is likely busier than the drive is rated for |
| Enterprise-class drive in a ≤ 2-bay unit | 7,200 rpm is noticeably louder on a desk |
| Unit has a `maxDriveTb` | State the ceiling, so the size list makes sense |

The workload figure is parsed out of free text (`"180 TB/year"` → 180); if it
can't be parsed, the rule stays silent rather than guessing.

---

## 4. The question order

Deliberate, and worth keeping:

1. **Storage** — by capacity *or* by budget (two different entry points).
2. **RAID level** — after capacity, because it changes what capacities exist.
3. **Drive bays** — Auto by default.
4. **Brand** — any / Synology / QNAP.
5. **Room to expand** — optional filter.
6. **Recommended unit** — the shortlist, best value first, with ⓘ specs and a comparison table.
7. **Network** — shown, not asked.
8. **Drives** — size and line, both defaulting to Auto, with ⓘ specs and compatibility notes.
9. **RAM & network upgrades** — hidden entirely when nothing is priced.
10. **Installation & AMC** — tick boxes that feed back into budget mode.

Each answer re-derives everything downstream; there is no "next" button and no
wizard state machine. One `Answers` object in, one `Derived` object out.

---

## 5. Worked examples from this catalogue

Check any port against these. All were produced by running the engine
against the catalogue in §1, with installation included and AMC off.

| Ask | Result |
|---|---|
| 20 TB usable, RAID 5, any brand | TS-433-4G + 3 × 10 TB IronWolf · 20 TB usable · ₹1,93,680 hardware, ₹1,99,580 total |
| 20 TB usable, RAID 1 | One mirrored pair: TS-233-2G + 2 × 20 TB WD Ultrastar · 20 TB usable · ₹2,25,958 hardware, ₹2,31,858 total |
| 4 TB usable, RAID 5 | TS-433-4G + 3 × 2 TB IronWolf · 4 TB usable · ₹1,01,871 hardware, ₹1,07,771 total — needs 3 bays, so every 2-bay chassis is excluded |
| 4 TB usable, RAID 0 | TS-233-2G + 2 × 2 TB IronWolf · 4 TB usable · ₹61,914 hardware, ₹67,814 total — **never** 1 × 4 TB |
| Budget ₹2,00,000, RAID auto | Picks RAID 5 at 20 TB over RAID 6 at 12 TB |
| Budget ₹2,00,000, RAID 6 forced | TS-433-4G + 4 × 6 TB WD Ultrastar · 12 TB usable · ₹1,63,944 hardware, ₹1,69,844 total — the cost of the second parity drive |
| Budget ₹50,000 | No build. Reports "₹50,000 doesn't cover a complete configuration. The least we can build with these choices is ₹67,814." |
| Synology, any target | No build ever quotes a drive above 24 TB; QNAP never above 32 TB |

Invariants worth asserting in a port's own tests, each checked against this
catalogue as this document was generated: **0** RAID 0 builds use a single drive,
**0** RAID 1 builds use other than two drives per unit, **0** Synology builds
exceed 24 TB per drive, **0** QNAP builds exceed 32 TB.

---

## 6. Porting checklist

- [ ] Five tables from §2, with `active` flags and restricted `minPrice`.
- [ ] Public payload rebuilt field by field, with no line that reads a minimum.
- [ ] RAID table from §3.1 — especially RAID 0 minimum 2 and RAID 10 step 2.
- [ ] `computeDrives` returning an impossible marker rather than throwing.
- [ ] Build enumeration with `maxDriveTb` filtering and the three-key sort.
- [ ] `buildableSizes` + `nearestBuildable`, so capacity input is snapped, not free-typed.
- [ ] Budget mode: extras inside the budget; redundancy-first RAID choice; cheapest-outlay fallback.
- [ ] `pickBuild` narrowing size *then* line, each with its own fallback.
- [ ] Pricing: per-chassis installation, AMC on hardware only, all-or-nothing floors.
- [ ] Network derived, never asked.
- [ ] Feasibility greying-out computed from the same build pool as the recommendation.
- [ ] One `Answers` object re-derived on every change, rather than wizard state (§9).
- [ ] Public and staff payloads the same shape, so one component serves both (§8).
- [ ] Every priced item editable, and hideable, without a deploy (§10).
- [ ] Role checks on the server, never only in the UI (§11).

## 7. Complete costing

Generated from the engine against the catalogue in §1. Every figure is
GST-inclusive; there is no separate tax line anywhere in the quote.

### 7.1 The formula, in full

```
nas       = model.quote        × units
hdd       = drive.quote        × drivesPerUnit × units
ram       = ramUpgrade.quote   × units          // one kit per chassis
nic       = nicUpgrade.quote   × units          // one card per chassis
hardware  = nas + hdd + ram + nic
install   = includeInstall ? installQuote × units : 0
amc       = includeAMC     ? hardware × amcRate   : 0    // hardware only
total     = hardware + install + amc
```

With today's settings: `installQuote` = ₹5,900 per chassis (floor ₹4,130), `amcRate` = 10% (floor 7%).

Three things are easy to get wrong:

- **Installation is per chassis, not per order.** A two-unit build is charged twice.
- **AMC is a percentage of hardware only.** It does not compound on installation, and it is an annual figure quoted once in the estimate.
- **Upgrades are per chassis.** Two units means two RAM kits and two network cards.

### 7.2 NAS units — cost, floor and room to negotiate

| Model | Bays | Quote ₹ | Floor ₹ | Margin ₹ | Margin % | ₹ per bay |
|---|--:|--:|--:|--:|--:|--:|
| TS-233-2G | 2 | 24,000 | 22,420 | 1,580 | 6.6% | 12,000 |
| DS223J | 2 | 24,000 | 22,420 | 1,580 | 6.6% | 12,000 |
| TS-216G-4G | 2 | 29,000 | 27,730 | 1,270 | 4.4% | 14,500 |
| DS225+ | 2 | 42,000 | 40,120 | 1,880 | 4.5% | 21,000 |
| TS-433-4G | 4 | 45,000 | 42,480 | 2,520 | 5.6% | 11,250 |
| TS-462-4G | 4 | 57,000 | 54,280 | 2,720 | 4.8% | 14,250 |
| DS425+ | 4 | 67,000 | 63,720 | 3,280 | 4.9% | 16,750 |
| TS-464-8G | 4 | 69,000 | 66,080 | 2,920 | 4.2% | 17,250 |
| TS-664-8G | 6 | 87,000 | 82,600 | 4,400 | 5.1% | 14,500 |
| DS725+ | 2 | 94,000 | 89,680 | 4,320 | 4.6% | 47,000 |
| DS925+ | 4 | 97,000 | 92,630 | 4,370 | 4.5% | 24,250 |
| TS-832PX-4G | 8 | 1,08,000 | 1,03,250 | 4,750 | 4.4% | 13,500 |
| TS-873A-8G | 8 | 1,30,000 | 1,23,900 | 6,100 | 4.7% | 16,250 |
| DS1525+ | 5 | 1,42,000 | 1,35,700 | 6,300 | 4.4% | 28,400 |
| DS1825+ | 8 | 1,80,000 | 1,71,100 | 8,900 | 4.9% | 22,500 |

### 7.3 Drives — cost, floor and cost per TB

| Capacity | Line | Quote ₹ | Floor ₹ | Margin ₹ | Margin % | Quote ₹/TB | Floor ₹/TB |
|--:|---|--:|--:|--:|--:|--:|--:|
| 2 TB | Exos | 21,683 | 20,650 | 1,033 | 4.8% | 10,842 | 10,325 |
| 2 TB | IronWolf | 18,957 | 18,054 | 903 | 4.8% | 9,479 | 9,027 |
| 4 TB | Exos | 27,510 | 26,200 | 1,310 | 4.8% | 6,878 | 6,550 |
| 4 TB | IronWolf | 22,054 | 21,004 | 1,050 | 4.8% | 5,514 | 5,251 |
| 6 TB | WD Ultrastar | 29,736 | 28,320 | 1,416 | 4.8% | 4,956 | 4,720 |
| 8 TB | Exos | 45,224 | 43,070 | 2,154 | 4.8% | 5,653 | 5,384 |
| 8 TB | IronWolf Pro | 48,321 | 46,020 | 2,301 | 4.8% | 6,040 | 5,753 |
| 10 TB | Exos | 52,038 | 49,560 | 2,478 | 4.8% | 5,204 | 4,956 |
| 10 TB | IronWolf | 49,560 | 47,200 | 2,360 | 4.8% | 4,956 | 4,720 |
| 10 TB | IronWolf Pro | 55,136 | 52,510 | 2,626 | 4.8% | 5,514 | 5,251 |
| 10 TB | WD Ultrastar | 50,180 | 47,790 | 2,390 | 4.8% | 5,018 | 4,779 |
| 12 TB | Exos | 68,145 | 64,900 | 3,245 | 4.8% | 5,679 | 5,408 |
| 12 TB | IronWolf Pro | 67,526 | 64,310 | 3,216 | 4.8% | 5,627 | 5,359 |
| 12 TB | WD Ultrastar | 67,526 | 64,310 | 3,216 | 4.8% | 5,627 | 5,359 |
| 16 TB | Exos | 83,633 | 79,650 | 3,983 | 4.8% | 5,227 | 4,978 |
| 16 TB | IronWolf Pro | 89,828 | 85,550 | 4,278 | 4.8% | 5,614 | 5,347 |
| 16 TB | WD Ultrastar | 84,872 | 80,830 | 4,042 | 4.8% | 5,305 | 5,052 |
| 18 TB | WD Ultrastar | 87,969 | 83,780 | 4,189 | 4.8% | 4,887 | 4,654 |
| 20 TB | Exos | 1,02,837 | 97,940 | 4,897 | 4.8% | 5,142 | 4,897 |
| 20 TB | IronWolf Pro | 1,06,554 | 1,01,480 | 5,074 | 4.8% | 5,328 | 5,074 |
| 20 TB | WD Ultrastar | 1,00,979 | 96,170 | 4,809 | 4.8% | 5,049 | 4,809 |
| 24 TB | WD Ultrastar | 1,18,944 | 1,13,280 | 5,664 | 4.8% | 4,956 | 4,720 |

Cheapest storage per TB: **18 TB WD Ultrastar** at ₹4,887/TB. Dearest: **2 TB Exos** at ₹10,842/TB — small drives cost roughly twice as much per TB, which is why the engine prefers fewer, larger drives.

### 7.4 Services

| Item | Basis | Quote | Floor | Margin |
|---|---|--:|--:|--:|
| Installation & setup | per chassis | ₹5,900 | ₹4,130 | 30.0% |
| AMC | % of hardware, per year | 10% | 7% | 30% of the rate |

### 7.5 Upgrades

Nothing is priced today, so the configurator hides the step. When RAM or a
network card is added it is charged **per chassis** and counts as hardware,
so it also raises the AMC figure.

### 7.6 Worked quotations, line by line

Each is the build the engine actually recommends, priced with installation
and AMC both on, showing the quote and the internal floor side by side.

#### 10 TB usable · RAID 5

**TS-433-4G** (QNAP, 4-bay) × 1 · 4 × 4 TB IronWolf · RAID 5 · **12 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹45,000 | 45,000 | 42,480 |
| Hard drives | 4 × ₹22,054 | 88,216 | 84,016 |
| **Hardware** | | **1,33,216** | **1,26,496** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 13,322 | 8,855 |
| **Total** | | **1,52,438** | **1,39,481** |

Effective cost: **₹12,703 per usable TB**, floor ₹11,623. Room to negotiate: **₹12,957** (8.5%).

#### 20 TB usable · RAID 5

**TS-433-4G** (QNAP, 4-bay) × 1 · 3 × 10 TB IronWolf · RAID 5 · **20 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹45,000 | 45,000 | 42,480 |
| Hard drives | 3 × ₹49,560 | 1,48,680 | 1,41,600 |
| **Hardware** | | **1,93,680** | **1,84,080** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 19,368 | 12,886 |
| **Total** | | **2,18,948** | **2,01,096** |

Effective cost: **₹10,947 per usable TB**, floor ₹10,055. Room to negotiate: **₹17,852** (8.2%).

#### 20 TB usable · RAID 6

**TS-433-4G** (QNAP, 4-bay) × 1 · 4 × 10 TB IronWolf · RAID 6 · **20 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹45,000 | 45,000 | 42,480 |
| Hard drives | 4 × ₹49,560 | 1,98,240 | 1,88,800 |
| **Hardware** | | **2,43,240** | **2,31,280** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 24,324 | 16,190 |
| **Total** | | **2,73,464** | **2,51,600** |

Effective cost: **₹13,673 per usable TB**, floor ₹12,580. Room to negotiate: **₹21,864** (8.0%).

#### 20 TB usable · RAID 1

**TS-233-2G** (QNAP, 2-bay) × 1 · 2 × 20 TB WD Ultrastar · RAID 1 · **20 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹24,000 | 24,000 | 22,420 |
| Hard drives | 2 × ₹1,00,979 | 2,01,958 | 1,92,340 |
| **Hardware** | | **2,25,958** | **2,14,760** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 22,596 | 15,033 |
| **Total** | | **2,54,454** | **2,33,923** |

Effective cost: **₹12,723 per usable TB**, floor ₹11,696. Room to negotiate: **₹20,531** (8.1%).

#### 50 TB usable · RAID 5

**TS-664-8G** (QNAP, 6-bay) × 1 · 6 × 10 TB IronWolf · RAID 5 · **50 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹87,000 | 87,000 | 82,600 |
| Hard drives | 6 × ₹49,560 | 2,97,360 | 2,83,200 |
| **Hardware** | | **3,84,360** | **3,65,800** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 38,436 | 25,606 |
| **Total** | | **4,28,696** | **3,95,536** |

Effective cost: **₹8,574 per usable TB**, floor ₹7,911. Room to negotiate: **₹33,160** (7.7%).

#### 50 TB usable · RAID 6, Synology only

**DS1825+** (Synology, 8-bay) × 1 · 7 × 10 TB IronWolf · RAID 6 · **50 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹1,80,000 | 1,80,000 | 1,71,100 |
| Hard drives | 7 × ₹49,560 | 3,46,920 | 3,30,400 |
| **Hardware** | | **5,26,920** | **5,01,500** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 52,692 | 35,105 |
| **Total** | | **5,85,512** | **5,40,735** |

Effective cost: **₹11,710 per usable TB**, floor ₹10,815. Room to negotiate: **₹44,777** (7.6%).

#### 100 TB usable · RAID 5

**TS-664-8G** (QNAP, 6-bay) × 1 · 6 × 20 TB WD Ultrastar · RAID 5 · **100 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹87,000 | 87,000 | 82,600 |
| Hard drives | 6 × ₹1,00,979 | 6,05,874 | 5,77,020 |
| **Hardware** | | **6,92,874** | **6,59,620** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 69,287 | 46,173 |
| **Total** | | **7,68,061** | **7,09,923** |

Effective cost: **₹7,681 per usable TB**, floor ₹7,099. Room to negotiate: **₹58,138** (7.6%).

#### Budget ₹1,50,000

**TS-233-2G** (QNAP, 2-bay) × 1 · 2 × 10 TB IronWolf · RAID 1 · **10 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹24,000 | 24,000 | 22,420 |
| Hard drives | 2 × ₹49,560 | 99,120 | 94,400 |
| **Hardware** | | **1,23,120** | **1,16,820** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 12,312 | 8,177 |
| **Total** | | **1,41,332** | **1,29,127** |

Effective cost: **₹14,133 per usable TB**, floor ₹12,913. Room to negotiate: **₹12,205** (8.6%).

#### Budget ₹3,00,000

**TS-433-4G** (QNAP, 4-bay) × 1 · 4 × 10 TB IronWolf · RAID 5 · **30 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹45,000 | 45,000 | 42,480 |
| Hard drives | 4 × ₹49,560 | 1,98,240 | 1,88,800 |
| **Hardware** | | **2,43,240** | **2,31,280** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 24,324 | 16,190 |
| **Total** | | **2,73,464** | **2,51,600** |

Effective cost: **₹9,115 per usable TB**, floor ₹8,387. Room to negotiate: **₹21,864** (8.0%).

#### Budget ₹5,00,000

**TS-433-4G** (QNAP, 4-bay) × 1 · 4 × 20 TB WD Ultrastar · RAID 5 · **60 TB usable**

| Line | Basis | Quote ₹ | Floor ₹ |
|---|---|--:|--:|
| NAS unit | 1 × ₹45,000 | 45,000 | 42,480 |
| Hard drives | 4 × ₹1,00,979 | 4,03,916 | 3,84,680 |
| **Hardware** | | **4,48,916** | **4,27,160** |
| Installation | 1 × ₹5,900 | 5,900 | 4,130 |
| AMC (1 year) | 10% of hardware | 44,892 | 29,901 |
| **Total** | | **4,99,708** | **4,61,191** |

Effective cost: **₹8,328 per usable TB**, floor ₹7,687. Room to negotiate: **₹38,516** (7.7%).

### 7.7 Margin at a glance

- NAS units: **4.9%** average margin (4.2–6.6%).
- Drives: **4.8%** average margin (4.8–4.8%).
- Installation: **30.0%**. AMC: **30%** of the rate (10% → 7%).

Hardware is thin and the services are not, so on a complete quote most of
the negotiating room sits in installation and AMC rather than in the boxes.

### 7.8 What a discount costs

The consultation offer gives up to ₹2,000 off. Against the floors above,
that is the smallest slice of the available margin on every build, so it
can always be honoured without going below the floor.

---

## 8. The API surface

Three routes are all the configurator itself needs; the rest serve the admin
panel. Paths are ours — what matters is the split.

| Route | Who | What it does |
|---|---|---|
| `GET /api/nas-pricing` | anyone | The public price list. Reads the CMS anonymously, runs it through `toPricingInput` then `normalisePricing`, returns `NasPricing`. Cached and tagged so a saved price clears it at once. Returns **503** rather than stale or partial data if the list is unusable. |
| `POST /api/contact` | anyone | Files a lead. The configurator posts the built configuration as `workloadDescription`. |
| `POST /api/nas-offer` | anyone | Files a lead **and** issues that customer a discount code, generated server side. |
| `GET /api/admin/nas` | admin | The whole catalogue *including* floors, for the price manager. |
| `POST/PATCH/DELETE /api/admin/nas/:collection[/:id]` | admin | Add, edit, remove or hide a model / drive / upgrade / drive line. Clears the pricing cache on every write. |
| `PATCH /api/admin/nas/settings` | admin | Installation and AMC. |
| `GET /api/admin/nas/pricing` | admin + sales | The same `NasPricing` shape as the public route but built by `toSalesPricing`, so every figure carries its floor. This is what the internal configurator reads. |
| `POST /api/admin/nas/lookup` | admin | Proposes a new model's specifications from the maker's page, or an upgrade's from its name. Returns values only — never saves. |

The public and staff payloads are **the same shape**, which is why one
configurator component serves both: it takes a `source` prop, fetches one URL or
the other, and shows a floor column only when `min` values are present.

---

## 9. UI behaviour and state

The whole configurator is **one state object in, one derived object out**. There
is no wizard, no step machine, no "next" button:

```ts
const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
const derived = useMemo(() => derive(answers, pricing), [answers, pricing]);
const price   = useMemo(() => priceFor(derived.build, answers, pricing), [...]);
const can     = useMemo(() => feasibleOptions(answers, pricing, derived), [...]);
```

Every answer re-derives everything downstream. Changing the RAID level changes
which capacities exist; changing the capacity changes which units qualify. That
falls out of re-deriving rather than being wired up by hand.

Rules the UI follows, each of which was a bug before it was a rule:

- **Impossible options are greyed, never hidden.** A disappearing tile makes the
  page feel broken; a greyed one with "can't reach this target" explains itself.
- **A pinned choice that becomes impossible is ignored, not obeyed** — see
  `pickBuild` in §3.7 — so the recommendation always moves when you click.
- **Auto is a real value, not a default that gets overwritten.** `driveCap: null`
  means "you choose"; picking a size sets it, and there is always a way back.
- **Network is shown, not asked** (§3.9).
- **The upgrades step hides itself** when nothing is priced.
- **The estimate panel is sticky**, with a mobile bar that appears when the panel
  scrolls out of view.
- **Prices come from the server on mount**; there is no built-in fallback price
  list, because a public page must not quote stale figures. Failure shows an
  error state, not old numbers.

Supporting pieces, all optional to a port: a specifications dialog and hover
card per model, a side-by-side comparison of the shortlist, drive-line specs
with compatibility notes, a PDF estimate, a lead form, and a consultation-offer
popup that issues discount codes.

---

## 10. The admin surface

Everything priced is editable by an admin without a deploy:

- **Pricing tab**, one sub-tab per kind (models, drives, drive specs, upgrades,
  installation & AMC), each with add / edit / remove, and an **In configurator**
  switch per row that shows or hides an item instantly without deleting it.
- **Change log** — every price or spec edit recorded with the editor's email,
  the field, and the before and after values.
- **Price sheet download** (CSV and PDF), marked internal because it carries the
  floors.
- **Auto-fill** for a new model's specifications (fetches the maker's spec page
  where the maker allows it, otherwise parses a pasted spec sheet) and for RAM
  and network cards from their names.
- **Internal sales configurator** — the same component, reading the staff
  payload, showing the floor beside every line.

---

## 11. Security rules

Four, in the order they matter:

1. **A floor price must never reach a browser.** The CMS restricts the field so
   an anonymous read cannot return it; the public route then rebuilds the
   payload field by field, so there is no line of code that could copy one
   across even by accident. Two independent defences, deliberately.
2. **Staff routes check the role server side**, not in the UI. The internal
   configurator and the price sheet are behind `requireStaff` / `requireAdmin`,
   and the CMS enforces the same rules again on its own.
3. **Only the server issues discount codes.** A code invented in the page could
   be forged or shared; each one is a record with the customer it belongs to.
4. **A spec-page lookup only fetches an allow-listed host.** A model name goes
   into a URL, so without that list the server would fetch whatever was typed,
   including addresses inside your own network.

---

## 12. Using the engine as it is

`docs/reference/` holds the four engine files, copied from the running site by
`Frontend/scripts/update-spec.ts`. They are pure TypeScript — no React, no DOM,
no imports beyond each other — so they can be dropped into any project:

| File | What it gives you |
|---|---|
| `types.ts` | `NasPricing`, `NasModel`, `Build`, `RaidLevel`, `Estimate` and friends |
| `logic.ts` | The maths and the search: `usableForN`, `computeDrives`, `suggestBuilds`, `buildableSizes`, `suggestBuildsForBudget`, `suggestBudgetPlan`, `cheapestOutlay`, network parsing, `inr` |
| `configure.ts` | `Answers` → `Derived`: `derive`, `feasibleOptions`, `pickBuild`, `priceFor`, `estimateLines`, `leadSummary` |
| `specs.ts` | Specification rows, the comparison table, and drive compatibility notes |

Wiring one up is three steps:

1. Build a `NasPricing` object from your own catalogue — the shape in §2 is the
   only contract. Where the prices live is up to you.
2. Hold one `Answers` object in state and call `derive(answers, pricing)`
   whenever it changes.
3. Render `derived.options` as the shortlist, `derived.build` as the
   recommendation, `priceFor(...)` as the estimate, and `feasibleOptions(...)`
   to decide what greys out.

Nothing in those files reads a minimum price. Floors only ever appear if you
hand `priceFor` a `NasPricing` that has them — which is exactly how the internal
sales configurator differs from the public one.

---

## 13. Source map

| Concern | File |
|---|---|
| Sizing maths, build search, budget planning | `Frontend/src/lib/nas/logic.ts` |
| Answers → derived quote, feasibility, pricing | `Frontend/src/lib/nas/configure.ts` |
| Public payload construction (strips floors) | `Frontend/src/lib/nas/normalise.ts` |
| Staff payload (keeps floors) | `Frontend/src/lib/nas/sales-pricing.ts` |
| CMS reads, admin writes | `Frontend/src/lib/nas/cms.ts` |
| Spec rows, compatibility notes | `Frontend/src/lib/nas/specs.ts` |
| UI | `Frontend/src/components/infrastructure/nas/` |
| Collections | `Backend/src/collections/Nas*.ts` |
