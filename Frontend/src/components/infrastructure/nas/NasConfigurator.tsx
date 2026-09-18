"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  BUDGET_PRESETS,
  CAPACITY_PRESETS,
  INITIAL_ANSWERS,
  SPEED_LABELS,
  SPEED_UNSURE,
  derive,
  estimateLines,
  estimateRef,
  feasibleOptions,
  leadSummary,
  priceFor,
  selectedUpgrade,
  speedFor,
  type Answers,
} from "@/lib/nas/configure";
import { RAID_INFO, RAID_LEVELS, bestNetworkAmong, inr, labelForSpeed, linesForCapacity, nearestBuildable } from "@/lib/nas/logic";
import type { Build, CompanyInfo, Estimate, NasPricing } from "@/lib/nas/types";
import { Alert, Badge, CheckTile, Chip, Field, Label, Note, Step, Tile, btnPrimary, btnSecondary, inputClass, linkBtn } from "./ui";
import { CompareDialog, InfoButton, SpecsDialog } from "./specs";

/* The NAS configurator on the NAS infrastructure page.
 *
 * Built from DigiBuggy's internal sales configurator, adapted for visitors:
 * quote prices only (no minimum reaches the browser — see /api/nas-pricing), no
 * sales-rep fields, and the quotation step files a lead in the CMS instead of
 * printing a rep's name. */

type Props = { company: CompanyInfo; infrastructureId: number | string | null };

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; pricing: NasPricing };

export function NasConfigurator({ company, infrastructureId }: Props) {
  const [load, setLoad] = useState<Load>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/nas-pricing")
      .then((res) => (res.ok ? (res.json() as Promise<NasPricing>) : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((pricing) => {
        if (!cancelled) setLoad({ status: "ready", pricing });
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.status === "loading") return <LoadingState />;
  if (load.status === "error") return <UnavailableState />;
  return <Configurator pricing={load.pricing} company={company} infrastructureId={infrastructureId} />;
}

type LeadState = { status: "idle" } | { status: "sending" } | { status: "sent"; ref: string };
type Details = { name: string; company: string; email: string; phone: string; location: string };

const EMPTY_DETAILS: Details = { name: "", company: "", email: "", phone: "", location: "" };
const MODELS_SHOWN = 5;
/** Columns the comparison table can hold before it stops being readable. */
const MODELS_COMPARED = 5;

function Configurator({ pricing: P, company, infrastructureId }: Props & { pricing: NasPricing }) {
  const [a, setA] = useState<Answers>(INITIAL_ANSWERS);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [lead, setLead] = useState<LeadState>({ status: "idle" });
  const [leadError, setLeadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showAllModels, setShowAllModels] = useState(false);
  const [specsFor, setSpecsFor] = useState<Build | null>(null);
  const [comparing, setComparing] = useState(false);

  const update = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));

  const d = useMemo(() => derive(a, P), [a, P]);
  const build = d.build;
  const price = useMemo(() => priceFor(build, a, P), [build, a, P]);
  const ram = selectedUpgrade(P, "RAM", a.ramSku);
  const nic = selectedUpgrade(P, "NIC", a.nicSku);
  const { net, nicTopGb, topGb, speed } = speedFor(build, nic, a.speed);
  const priced = Boolean(build && price && !d.error);
  const raid = RAID_INFO[d.raid];

  const brands = useMemo(() => [...new Set(P.models.map((m) => m.brand).filter(Boolean))].sort(), [P]);
  const tiers = useMemo(() => [...new Set(P.models.map((m) => m.bays))].sort((x, y) => x - y), [P]);
  const expandables = useMemo(() => P.models.filter((m) => m.expandable), [P]);
  const ramOptions = P.upgrades.filter((u) => u.category === "RAM");
  const nicOptions = P.upgrades.filter((u) => u.category === "NIC");
  const hasUpgrades = ramOptions.length + nicOptions.length > 0;

  // Which bay sizes, drive sizes and drive lines can actually be built. Options
  // that can't are greyed out rather than accepted and then refused.
  const can = useMemo(() => feasibleOptions(a, P, d), [a, P, d]);
  const cantLabel = d.mode === "budget" ? "Doesn't fit your budget" : "Can't reach this target";
  // The tightest fit at that size — the same build the size is offered for.
  const reach = (tier: number) => {
    const fits = can.bayPool.filter((b) => b.model.bays === tier);
    if (!fits.length) return cantLabel;
    const best = fits.reduce((a, b) => (b.model.bays - b.drivesPerUnit < a.model.bays - a.drivesPerUnit ? b : a));
    const spare = best.model.bays - best.drivesPerUnit;
    return `${best.drivesPerUnit}× ${best.driveCap} TB${best.units > 1 ? ` · ${best.units} units` : ""}${spare > 0 ? ` · ${spare} spare` : ""}`;
  };
  // A pinned choice stays clickable even when it stops working, so there's always a way back.
  const blocked = (ok: boolean, isChecked: boolean) => !ok && !isChecked && !d.error;

  const capacityPresets = useMemo(
    () => CAPACITY_PRESETS.map((p) => nearestBuildable(p, d.sizes)).filter((v, i, arr): v is number => v != null && arr.indexOf(v) === i),
    [d.sizes],
  );

  const driveLines =
    a.driveCap != null
      ? linesForCapacity(P.hddPricing, a.driveCap)
      : [...new Set(P.capacities.flatMap((c) => Object.keys(P.hddPricing[c] || {})))];

  const bestAvailable = bestNetworkAmong(d.options);
  const faster = bestAvailable && bestAvailable.topGb > (net?.topGb ?? 0) ? bestAvailable : null;

  const visibleOptions = showAllModels ? d.options : d.options.filter((b, i) => i < MODELS_SHOWN || b.model.id === build?.model.id);
  const hiddenCount = d.options.length - visibleOptions.length;

  const step = { upgrades: 9, addons: hasUpgrades ? 10 : 9, details: hasUpgrades ? 11 : 10 };

  // Phone/tablet: a running total pinned to the bottom while the steps are on
  // screen, gone again once the full estimate is in view.
  const stepsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [stepsInView, setStepsInView] = useState(false);
  const [panelInView, setPanelInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === stepsRef.current) setStepsInView(entry.isIntersecting);
        if (entry.target === panelRef.current) setPanelInView(entry.isIntersecting);
      }
    });
    if (stepsRef.current) io.observe(stepsRef.current);
    if (panelRef.current) io.observe(panelRef.current);
    return () => io.disconnect();
  }, []);

  function setMode(mode: Answers["storageMode"]) {
    if (mode === a.storageMode) return;
    if (mode === "budget") {
      update({ storageMode: "budget", raidAuto: true, budget: a.budget && a.budget > 0 ? a.budget : 200000 });
    } else {
      // Carry the budget build across, so capacity mode starts from what was on screen.
      update({ storageMode: "capacity", raid: d.raid, targetTB: build ? build.totalUsable : a.targetTB });
    }
  }

  function scrollToId(id: string, focusId?: string) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (focusId) {
      window.setTimeout(() => document.getElementById(focusId)?.focus({ preventScroll: true }), reduce ? 0 : 450);
    }
  }

  async function downloadPdf() {
    if (!build || !price) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const estimate: Estimate = {
        ref: estimateRef(),
        model: build.model,
        units: build.units,
        drivesPerUnit: build.drivesPerUnit,
        totalDrives: price.totalDrives,
        driveCap: build.driveCap,
        driveLine: build.driveLine,
        raid: d.raid,
        raidLabel: raid.label,
        usableTB: build.totalUsable,
        speed: speed ?? "Not specified",
        expandable: a.expandable,
        lines: estimateLines(build, price, a, P, d.raid),
        total: price.total,
        customer: { name: details.name.trim(), company: details.company.trim(), location: details.location.trim() },
      };
      // Loaded on demand: jsPDF is ~400 KB and most visitors never download.
      const { downloadEstimatePdf } = await import("@/lib/nas/pdf");
      await downloadEstimatePdf(estimate, company);
    } catch (err) {
      console.error("[nas-configurator] PDF failed", err);
      setDownloadError("Couldn't build the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!build || !price) return;

    const name = details.name.trim();
    const org = details.company.trim();
    const email = details.email.trim();
    if (!name || !org || !/^\S+@\S+\.\S+$/.test(email)) {
      setLeadError("Please add your name, company and a valid work email.");
      return;
    }

    setLeadError(null);
    setLead({ status: "sending" });
    const ref = estimateRef();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company: org,
          email,
          phone: details.phone.trim() || undefined,
          interestedInfrastructure: infrastructureId != null ? [infrastructureId] : undefined,
          workloadDescription: leadSummary(d, build, price, speed, a, P, ref),
          message: details.location.trim() ? `Location: ${details.location.trim()}` : undefined,
          sourceUrl: window.location.href,
          utmSource: "nas-configurator",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
      setLead({ status: "sent", ref });
    } catch (err) {
      setLead({ status: "idle" });
      setLeadError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const panelRows =
    build && price
      ? [
          { label: "NAS unit", basis: `${build.units} × ${inr(build.model.quote)}`, amount: price.nas },
          { label: "Hard drives", basis: `${price.totalDrives} × ${inr(price.driveRate)}`, amount: price.hdd },
          ...(ram ? [{ label: "RAM upgrade", basis: `${build.units} × ${inr(ram.quote)}`, amount: price.ram }] : []),
          ...(nic ? [{ label: "Network card", basis: `${build.units} × ${inr(nic.quote)}`, amount: price.nic }] : []),
          ...(a.includeInstall ? [{ label: "Installation & setup", basis: `${build.units} × ${inr(P.install.quote)}`, amount: price.install }] : []),
          ...(a.includeAMC ? [{ label: "Annual maintenance", basis: `${Math.round(P.amcRate.quote * 100)}% of hardware`, amount: price.amc }] : []),
        ]
      : [];

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
        <div ref={stepsRef} className="grid gap-4 xl:grid-cols-2">
          {/* 1 · storage */}
          <Step
            n={1}
            title="How much storage do you need?"
            desc="Size by capacity if you know the space you need, or by budget to see the most storage an amount buys."
            className="xl:col-span-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <Tile name="storageMode" checked={a.storageMode === "capacity"} onSelect={() => setMode("capacity")} title="By capacity" sub="I know how much space I need" />
              <Tile name="storageMode" checked={a.storageMode === "budget"} onSelect={() => setMode("budget")} title="By budget" sub="Show me what an amount buys" />
            </div>

            {a.storageMode === "capacity" ? (
              d.error ? (
                <Alert tone="error">{d.error}</Alert>
              ) : (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <div className="relative sm:w-44">
                      <select
                        aria-label="Usable storage"
                        value={d.targetTB}
                        onChange={(e) => update({ targetTB: Number(e.target.value) })}
                        className="font-display h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background pl-4 pr-10 text-xl font-bold tabular-nums text-foreground focus:border-accent focus:outline-none"
                      >
                        {d.sizes.map((v) => (
                          <option key={v} value={v}>
                            {v} TB
                          </option>
                        ))}
                      </select>
                      <ChevronIcon />
                    </div>
                    {build ? (
                      <p className="text-sm leading-relaxed text-muted">
                        <b className="font-semibold text-foreground">{d.targetTB} TB usable</b> = {build.drivesPerUnit}× {build.driveCap} TB drives at{" "}
                        {raid.title}
                        {build.units > 1 ? ` across ${build.units} units` : ""}.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {capacityPresets.map((p) => (
                      <Chip key={p} on={d.targetTB === p} onClick={() => update({ targetTB: p })}>
                        {p} TB
                      </Chip>
                    ))}
                  </div>
                  <Note>
                    {d.sizes.length} sizes can be built at {raid.title}
                    {a.bays != null ? ` in a ${a.bays}-bay unit` : ""}
                    {a.brand !== "any" ? ` from ${a.brand}` : ""}. Other figures can&rsquo;t be made from whole drives.
                  </Note>
                  {d.movedFrom != null ? (
                    <Alert tone="warn">
                      {d.movedFrom} TB can&rsquo;t be built with these choices — showing {d.targetTB} TB, the closest size that can.
                    </Alert>
                  ) : null}
                </>
              )
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <label className="relative block sm:w-56">
                    <span className="sr-only">Budget in rupees</span>
                    <span aria-hidden className="font-display pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1000}
                      step={1000}
                      value={a.budget ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        update({ budget: e.target.value !== "" && Number.isFinite(v) ? v : null });
                      }}
                      className="font-display h-12 w-full rounded-md border border-border bg-background pl-10 pr-3 text-xl font-bold tabular-nums text-foreground focus:border-accent focus:outline-none"
                    />
                  </label>
                  {build && !d.error ? (
                    <p className="text-sm leading-relaxed text-muted">
                      {inr(a.budget)} buys <b className="font-semibold text-foreground">{build.totalUsable} TB usable</b> at {raid.title}
                      {build.units > 1 ? ` across ${build.units} units` : ""}.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_PRESETS.map((p) => (
                    <Chip key={p} on={a.budget === p} onClick={() => update({ budget: p })}>
                      {inr(p)}
                    </Chip>
                  ))}
                </div>
                <Note>Your budget covers the NAS unit and drives. Installation and AMC, if you add them, come on top.</Note>
                {d.error ? <Alert tone="error">{d.error}</Alert> : null}
              </>
            )}
          </Step>

          {/* 2 · RAID */}
          <Step n={2} title="RAID level" desc="How drives are arranged: how much raw capacity is usable, and how many drive failures the array survives.">
            {a.storageMode === "budget" ? (
              a.raidAuto ? (
                <Note>Picked for you — the most protective level your budget allows.</Note>
              ) : (
                <Note>
                  Chosen by you.{" "}
                  <button type="button" onClick={() => update({ raidAuto: true, speed: null })} className={linkBtn}>
                    Let us choose again
                  </button>
                </Note>
              )
            ) : null}
            <div className="grid gap-2">
              {RAID_LEVELS.map((r) => (
                <Tile
                  row
                  key={r}
                  name="raid"
                  checked={d.raid === r}
                  onSelect={() => update({ raid: r, speed: null, ...(a.storageMode === "budget" ? { raidAuto: false } : {}) })}
                  title={RAID_INFO[r].title}
                  sub={RAID_INFO[r].sub}
                />
              ))}
            </div>
          </Step>

          {/* 3 · bays */}
          <Step n={3} title="Drive bays" desc="How many drives the unit holds. Auto picks the size that fits best.">
            <div className="grid grid-cols-3 gap-2">
              <Tile compact name="bays" checked={a.bays == null} onSelect={() => update({ bays: null, speed: null })} title="Auto" sub="Best fit" />
              {tiers.map((t) => (
                <Tile
                  compact
                  key={t}
                  name="bays"
                  checked={a.bays === t}
                  disabled={blocked(can.bays.has(t), a.bays === t)}
                  onSelect={() => update({ bays: t, speed: null })}
                  title={`${t}-bay`}
                  sub={reach(t)}
                />
              ))}
            </div>
            {a.bays != null && !d.options.length && !d.error ? (
              <Alert tone="error">No {a.bays}-bay unit can do this — try Auto or another size.</Alert>
            ) : null}
          </Step>

          {/* 4 · brand */}
          <Step n={4} title="Brand" desc="Leave it open unless you have a preference — it widens what we can recommend.">
            <div className="grid grid-cols-3 gap-2">
              <Tile name="brand" checked={a.brand === "any"} onSelect={() => update({ brand: "any", speed: null })} title="Any" sub="Recommend from all" />
              {brands.map((b) => (
                <Tile
                  key={b}
                  name="brand"
                  checked={a.brand.toLowerCase() === b.toLowerCase()}
                  onSelect={() => update({ brand: b, speed: null })}
                  title={b}
                  sub={`${P.models.filter((m) => m.brand === b).length} units`}
                />
              ))}
            </div>
          </Step>

          {/* 5 · expansion */}
          <Step n={5} title="Room to expand" desc="Optional. Some units take an expansion enclosure for more drives later.">
            <CheckTile
              checked={a.expandable}
              onToggle={(v) => update({ expandable: v })}
              title="I want room to expand later"
              sub="Only recommend units that take an expansion unit"
            />
            <Note>
              {a.expandable
                ? `Recommending from ${expandables.length} expandable unit${expandables.length === 1 ? "" : "s"}.`
                : `${expandables.length} of ${P.models.length} units take an expansion unit.`}
            </Note>
          </Step>

          {/* 6 · recommended unit */}
          <Step n={6} title="Recommended NAS" desc="Worked out from your choices — unit, drives and drive count together, best value first." className="xl:col-span-2">
            {d.error ? (
              <Alert tone="error">Nothing to recommend until the storage above can be built.</Alert>
            ) : !d.options.length ? (
              <Alert tone="error">
                No unit can do {d.targetTB} TB at {raid.title}
                {a.brand !== "any" ? ` from ${a.brand}` : ""}
                {a.expandable ? " with room to expand" : ""}. Widen one of the choices above.
              </Alert>
            ) : (
              <>
                {d.autoPick ? (
                  <Note>
                    Our recommendation for {d.targetTB} TB at {raid.title}. Pick another if you prefer.
                  </Note>
                ) : (
                  <Note>
                    Chosen by you.{" "}
                    <button type="button" onClick={() => update({ autoPick: true, speed: null })} className={linkBtn}>
                      Use our recommendation
                    </button>
                  </Note>
                )}
                <div className="grid gap-2">
                  {visibleOptions.map((b) => (
                    <ModelCard
                      key={b.model.id}
                      build={b}
                      recommended={b === d.options[0]}
                      chosen={b.model.id === build?.model.id}
                      targetTB={d.targetTB}
                      onSelect={() => update({ modelId: b.model.id, autoPick: false, speed: null })}
                      onSpecs={() => setSpecsFor(b)}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {hiddenCount > 0 || showAllModels ? (
                    <button type="button" onClick={() => setShowAllModels((v) => !v)} className={`${linkBtn} text-sm`}>
                      {showAllModels ? "Show fewer" : `Show ${hiddenCount} more unit${hiddenCount === 1 ? "" : "s"}`}
                    </button>
                  ) : null}
                  {d.options.length > 1 ? (
                    <button type="button" onClick={() => setComparing(true)} className={`${linkBtn} text-sm`}>
                      Compare {Math.min(d.options.length, MODELS_COMPARED)} units side by side
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </Step>

          {/* 7 · network */}
          <Step n={7} title="Network speed" desc="What the recommended unit connects at out of the box." className="xl:col-span-2">
            {!build ? (
              <Note>Choose a unit above to see its network ports.</Note>
            ) : !net && !nic ? (
              <Alert tone="warn">We don&rsquo;t have the network ports on record for {build.model.id} — our team will confirm them.</Alert>
            ) : (
              <>
                {net?.builtIn ? (
                  <Note>
                    <b className="font-semibold text-foreground">{build.model.id}</b> ships with <b className="font-semibold text-foreground">{net.builtIn}</b>.
                  </Note>
                ) : (
                  <Alert tone="warn">No built-in ports on record for {build.model.id}.</Alert>
                )}
                {nic ? (
                  <Note>
                    With the {nic.name} added, it reaches {labelForSpeed(nicTopGb) ?? nic.spec}.
                  </Note>
                ) : net?.upgrade ? (
                  <Note>
                    Can be upgraded to {net.upgrade} with an add-in card{hasUpgrades ? " — see the upgrades below" : " — ask us to include one"}.
                  </Note>
                ) : null}
                {faster ? (
                  <Note>
                    Need more throughput? {faster.model.id} has {faster.builtIn} built in.
                  </Note>
                ) : null}
              </>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SPEED_LABELS.map((label) => {
                const gb = parseFloat(label);
                const sub =
                  topGb >= gb ? (nicTopGb >= gb && (net?.topGb ?? 0) < gb ? "With the network card" : "Supported") : "Needs a faster unit or card";
                return <Tile key={label} name="speed" checked={speed === label} onSelect={() => update({ speed: label })} title={label} sub={sub} />;
              })}
              <Tile name="speed" checked={speed === SPEED_UNSURE} onSelect={() => update({ speed: SPEED_UNSURE })} title="Not sure" sub="We'll advise" />
            </div>
          </Step>

          {/* 8 · drives */}
          <Step n={8} title="Drives" desc="We pick these for you. Choose a size or drive line and the recommendation updates." className="xl:col-span-2">
            {build ? (
              <Note>
                Recommended:{" "}
                <b className="font-semibold text-foreground">
                  {build.drivesPerUnit}× {build.driveCap} TB {build.driveLine}
                </b>
                {build.units > 1 ? ` per unit, ${build.units} units` : ""}.
              </Note>
            ) : null}
            <div>
              <Label>Drive size</Label>
              <div className="grid grid-cols-4 gap-2">
                <Tile compact name="driveCap" checked={a.driveCap == null} onSelect={() => update({ driveCap: null })} title="Auto" />
                {P.capacities.map((c) => {
                  const off = blocked(can.caps.has(c), a.driveCap === c);
                  return (
                    <Tile
                      compact
                      key={c}
                      name="driveCap"
                      checked={a.driveCap === c}
                      disabled={off}
                      onSelect={() => update({ driveCap: c })}
                      title={`${c} TB`}
                      sub={off ? cantLabel : undefined}
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Drive line</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Tile name="driveLine" checked={a.driveLine == null} onSelect={() => update({ driveLine: null })} title="Auto" sub="Best value" />
                {driveLines.map((l) => {
                  const off = blocked(can.lines.has(l), a.driveLine === l);
                  const rate = a.driveCap != null ? P.hddPricing[a.driveCap]?.[l]?.quote : undefined;
                  return (
                    <Tile
                      key={l}
                      name="driveLine"
                      checked={a.driveLine === l}
                      disabled={off}
                      onSelect={() => update({ driveLine: l })}
                      title={l}
                      sub={off ? cantLabel : rate ? `${inr(rate)} each` : undefined}
                    />
                  );
                })}
              </div>
            </div>
            {a.driveCap == null && a.driveLine ? <Note>Priced at whichever size the recommendation picks.</Note> : null}
          </Step>

          {/* 9 · upgrades — only when something is priced */}
          {hasUpgrades ? (
            <Step n={step.upgrades} title="RAM & network upgrades" desc="Optional, one per unit. Our team confirms compatibility before you order." className="xl:col-span-2">
              {ramOptions.length ? (
                <div>
                  <Label>RAM upgrade</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Tile name="ramSku" checked={a.ramSku == null} onSelect={() => update({ ramSku: null })} title="None" sub="Not needed" />
                    {ramOptions.map((u) => (
                      <Tile key={u.sku} name="ramSku" checked={a.ramSku === u.sku} onSelect={() => update({ ramSku: u.sku })} title={u.name} sub={`${inr(u.quote)} per unit`} />
                    ))}
                  </div>
                </div>
              ) : null}
              {nicOptions.length ? (
                <div>
                  <Label>Network card</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Tile name="nicSku" checked={a.nicSku == null} onSelect={() => update({ nicSku: null, speed: null })} title="None" sub="Not needed" />
                    {nicOptions.map((u) => {
                      const cardSpeed = labelForSpeed(parseFloat(`${u.name} ${u.spec}`.match(/(\d+(?:\.\d+)?)\s*GbE/i)?.[1] ?? "0"));
                      return (
                        <Tile
                          key={u.sku}
                          name="nicSku"
                          checked={a.nicSku === u.sku}
                          onSelect={() => update({ nicSku: u.sku, speed: null })}
                          title={u.name}
                          sub={`${cardSpeed ? `${cardSpeed} · ` : ""}${inr(u.quote)} per unit`}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Step>
          ) : null}

          {/* add-ons */}
          <Step n={step.addons} title="Installation & support" desc="Both optional." className="xl:col-span-2">
            <CheckTile
              checked={a.includeInstall}
              onToggle={(v) => update({ includeInstall: v })}
              title="On-site installation & setup"
              sub="Racking, RAID configuration and network setup. Charged per NAS unit."
              aside={<PriceAside value={inr(P.install.quote)} unit="per unit" />}
            />
            <CheckTile
              checked={a.includeAMC}
              onToggle={(v) => update({ includeAMC: v })}
              title="Annual maintenance (AMC)"
              sub="Ongoing support, charged on the hardware value. Installation isn't included."
              aside={<PriceAside value={`${Math.round(P.amcRate.quote * 100)}%`} unit="of hardware" />}
            />
          </Step>

          {/* details → lead */}
          <Step
            id="nas-details"
            n={step.details}
            title="Get a formal quotation"
            desc="Send us this configuration and our team will confirm availability and final pricing."
            className="xl:col-span-2"
          >
            {lead.status === "sent" ? (
              <div role="status" className="rounded-lg border border-[#cbe7d3] bg-[#e6f4ea] px-4 py-4 text-sm text-[#1e4d2b]">
                <p className="font-semibold">Thanks — we&rsquo;ve received your configuration.</p>
                <p className="mt-1">Reference {lead.ref}. Our team will be in touch with a formal quotation.</p>
              </div>
            ) : (
              <form onSubmit={submitLead} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="nas-name" label="Your name" required>
                    <input
                      id="nas-name"
                      autoComplete="name"
                      value={details.name}
                      onChange={(e) => setDetails((prev) => ({ ...prev, name: e.target.value }))}
                      className={inputClass}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field id="nas-company" label="Company" required>
                    <input
                      id="nas-company"
                      autoComplete="organization"
                      value={details.company}
                      onChange={(e) => setDetails((prev) => ({ ...prev, company: e.target.value }))}
                      className={inputClass}
                      placeholder="Company name"
                    />
                  </Field>
                  <Field id="nas-email" label="Work email" required>
                    <input
                      id="nas-email"
                      type="email"
                      autoComplete="email"
                      value={details.email}
                      onChange={(e) => setDetails((prev) => ({ ...prev, email: e.target.value }))}
                      className={inputClass}
                      placeholder="you@company.com"
                    />
                  </Field>
                  <Field id="nas-phone" label="Phone">
                    <input
                      id="nas-phone"
                      type="tel"
                      autoComplete="tel"
                      value={details.phone}
                      onChange={(e) => setDetails((prev) => ({ ...prev, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="Phone number"
                    />
                  </Field>
                  <Field id="nas-location" label="City" className="sm:col-span-2">
                    <input
                      id="nas-location"
                      autoComplete="address-level2"
                      value={details.location}
                      onChange={(e) => setDetails((prev) => ({ ...prev, location: e.target.value }))}
                      className={inputClass}
                      placeholder="City"
                    />
                  </Field>
                </div>
                {leadError ? (
                  <Alert tone="error" live>
                    {leadError}
                  </Alert>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button type="submit" disabled={!priced || lead.status === "sending"} className={btnPrimary}>
                    {lead.status === "sending" ? <Spinner className="h-4 w-4" /> : null}
                    {lead.status === "sending" ? "Sending…" : "Request formal quotation"}
                  </button>
                  {!priced ? <Note>Choose a configuration that can be built, then send it to us.</Note> : null}
                </div>
              </form>
            )}
          </Step>

        </div>

        {/* live estimate */}
        <aside
          ref={panelRef}
          id="nas-estimate"
          aria-label="Your estimate"
          className="scroll-mt-20 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_24px_48px_-32px_rgba(16,21,28,0.35)]">
            <div className="bg-ink-800 px-5 py-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">Your estimate</p>
              {build ? (
                <>
                  <p className="font-display mt-2 text-2xl font-bold tracking-tight">
                    {build.model.id}
                    {build.units > 1 ? ` × ${build.units}` : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted-2">
                    {build.model.brand} · {build.model.bays}-bay NAS
                  </p>
                </>
              ) : (
                <p className="font-display mt-2 text-lg font-bold">No unit yet</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-px bg-border">
              {[
                ["Usable", build ? `${build.totalUsable} TB` : "—"],
                ["RAID", raid.title],
                ["Drives", build && price ? `${price.totalDrives}× ${build.driveCap} TB` : "—"],
                ["Network", speed === SPEED_UNSURE ? "To advise" : (speed ?? "—")],
              ].map(([k, v]) => (
                <div key={k} className="bg-background px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{k}</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-border px-5 py-4">
              {priced ? (
                <table className="w-full text-sm">
                  <tbody>
                    {panelRows.map((r) => (
                      <tr key={r.label} className="border-b border-border last:border-0">
                        <td className="py-2.5 pr-3 align-top">
                          <span className="block text-foreground">{r.label}</span>
                          <span className="block text-xs text-muted">{r.basis}</span>
                        </td>
                        <td className="py-2.5 text-right align-top font-medium tabular-nums text-foreground">{inr(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Note>Line items appear here once a configuration can be built.</Note>
              )}
              <div className="mt-2 flex items-baseline justify-between gap-3 border-t-2 border-foreground pt-3">
                <span className="text-sm font-semibold text-foreground">
                  Total <span className="font-normal text-muted">incl. GST</span>
                </span>
                <span className="font-display text-2xl font-bold tabular-nums text-foreground" aria-live="polite">
                  {priced && price ? inr(price.total) : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-border bg-surface px-5 py-4">
              <button type="button" onClick={() => scrollToId("nas-details", "nas-name")} disabled={!priced} className={`${btnPrimary} w-full`}>
                Request formal quotation
              </button>
              <button type="button" onClick={downloadPdf} disabled={!priced || downloading} className={`${btnSecondary} w-full`}>
                {downloading ? <Spinner className="h-4 w-4" /> : <DownloadIcon />}
                {downloading ? "Preparing PDF…" : "Download estimate (PDF)"}
              </button>
              {downloadError ? (
                <p role="alert" className="text-xs text-accent">
                  {downloadError}
                </p>
              ) : null}
              <p className="text-xs leading-relaxed text-muted">
                Prices include GST and come from our live price list. This is an estimate — availability and final pricing are confirmed in your formal
                quotation.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <MobileBar visible={stepsInView && !panelInView} total={priced && price ? price.total : null} onView={() => scrollToId("nas-estimate")} />

      {specsFor ? (
        <SpecsDialog
          build={specsFor}
          raid={d.raid}
          chosen={specsFor.model.id === build?.model.id}
          onChoose={() => {
            update({ modelId: specsFor.model.id, autoPick: false, speed: null });
            setSpecsFor(null);
          }}
          onClose={() => setSpecsFor(null)}
        />
      ) : null}

      {comparing ? (
        <CompareDialog
          builds={d.options.slice(0, MODELS_COMPARED)}
          raid={d.raid}
          chosenId={build?.model.id ?? null}
          onChoose={(modelId) => {
            update({ modelId, autoPick: false, speed: null });
            setComparing(false);
          }}
          onClose={() => setComparing(false)}
        />
      ) : null}
    </>
  );
}

function ModelCard({
  build: b,
  recommended,
  chosen,
  targetTB,
  onSelect,
  onSpecs,
}: {
  build: Build;
  recommended: boolean;
  chosen: boolean;
  targetTB: number;
  onSelect: () => void;
  onSpecs: () => void;
}) {
  const extra = b.totalUsable - targetTB;
  return (
    <label
      className={`flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 sm:flex-row sm:items-center sm:justify-between ${
        chosen ? "border-accent bg-tint shadow-[inset_0_0_0_1px_var(--accent)]" : "border-border bg-background hover:border-border-strong"
      }`}
    >
      <input type="radio" name="modelId" checked={chosen} onChange={onSelect} className="sr-only" />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-display text-base font-bold tracking-tight text-foreground">{b.model.id}</span>
          <Badge>{b.model.brand}</Badge>
          {recommended ? <Badge tone="accent">Recommended</Badge> : null}
          {b.model.expandable ? <Badge tone="tint">Expandable</Badge> : null}
          {b.units > 1 ? <Badge tone="dark">{b.units} units</Badge> : null}
          <InfoButton build={b} onOpen={onSpecs} />
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted">
          {b.drivesPerUnit}× {b.driveCap} TB {b.driveLine} in {b.model.bays} bays
          {b.units > 1 ? ` × ${b.units} units` : ""} · {b.totalUsable} TB usable
          {extra > 0 ? ` (${extra} TB extra)` : ""} · {b.spareBays} spare bay{b.spareBays === 1 ? "" : "s"}
        </span>
      </span>
      <span className="shrink-0 sm:text-right">
        <span className="font-display block text-lg font-bold tabular-nums text-foreground">{inr(b.totalQuote)}</span>
        <span className="block text-xs text-muted">Unit + drives, incl. GST</span>
      </span>
    </label>
  );
}

function PriceAside({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="block text-right">
      <span className="block text-sm font-semibold tabular-nums text-foreground">{value}</span>
      <span className="block text-xs text-muted">{unit}</span>
    </span>
  );
}

function MobileBar({ visible, total, onView }: { visible: boolean; total: number | null; onView: () => void }) {
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Estimate</p>
          <p className="font-display text-lg font-bold tabular-nums text-foreground">{total != null ? inr(total) : "—"}</p>
        </div>
        <button type="button" onClick={onView} tabIndex={visible ? 0 : -1} className={btnPrimary}>
          View estimate
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div role="status" className="flex items-center gap-3 rounded-lg border border-border bg-background px-6 py-10 text-sm text-muted">
      <Spinner className="h-4 w-4" />
      Loading current pricing…
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="rounded-lg border border-border bg-background p-6 sm:p-8">
      <h3 className="font-display text-lg font-bold tracking-tight text-foreground">Live pricing is unavailable right now</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Tell us how much storage you need and our team will size and price a NAS for you.
      </p>
      <div className="mt-5">
        <ButtonLink href="/request-a-solution?source=nas-configurator">Tell Us What You Need &rarr;</ButtonLink>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
