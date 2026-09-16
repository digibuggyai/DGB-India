"use client";

import { useEffect, type ReactNode } from "react";
import { buildSpecs, compareRows, keySpecs, modelSpecs, type Spec } from "@/lib/nas/specs";
import { inr } from "@/lib/nas/logic";
import type { Build, RaidLevel } from "@/lib/nas/types";
import { Badge, btnPrimary, btnSecondary } from "./ui";

/* Specifications for a recommended unit: a hover card on the ⓘ, the full list
 * on click, and a side-by-side comparison of the shortlist. */

/** The ⓘ on a model card. Hover or keyboard focus shows the summary; clicking
 *  opens the full specifications. It sits inside the card's label, so the click
 *  must be kept from selecting the unit underneath. */
export function InfoButton({ build, onOpen }: { build: Build; onOpen: () => void }) {
  return (
    <span className="group/info relative inline-flex">
      <button
        type="button"
        aria-label={`Specifications for ${build.model.id}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-border-strong text-[11px] font-bold text-muted transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-60 -translate-x-1/2 rounded-md border border-border bg-background p-3 text-left shadow-[0_16px_32px_-16px_rgba(16,21,28,0.45)] group-focus-within/info:block group-hover/info:block sm:left-0 sm:translate-x-0"
      >
        <span className="font-display block text-sm font-bold tracking-tight text-foreground">{build.model.id}</span>
        <span className="mt-1.5 block space-y-1">
          {keySpecs(build.model).map((s) => (
            <span key={s.label} className="flex justify-between gap-3 text-xs leading-snug">
              <span className="text-muted">{s.label}</span>
              <span className="text-right font-medium text-foreground">{s.value}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[11px] text-muted">Click for all specifications</span>
      </span>
    </span>
  );
}

function Modal({ title, onClose, wide = false, children }: { title: string; onClose: () => void; wide?: boolean; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-800/50 backdrop-blur-[2px] sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-[0_32px_64px_-32px_rgba(16,21,28,0.6)] sm:rounded-lg ${
          wide ? "sm:max-w-4xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h3>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function SpecTable({ specs }: { specs: Spec[] }) {
  return (
    <dl className="divide-y divide-border">
      {specs.map((s) => (
        <div key={s.label} className="flex items-start justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted">{s.label}</dt>
          <dd className="text-right text-sm font-medium text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SpecsDialog({ build, raid, chosen, onChoose, onClose }: { build: Build; raid: RaidLevel; chosen: boolean; onChoose: () => void; onClose: () => void }) {
  return (
    <Modal title={`${build.model.id} specifications`} onClose={onClose}>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{build.model.brand}</Badge>
          {build.model.expandable ? <Badge tone="tint">Expandable</Badge> : null}
          {chosen ? <Badge tone="accent">Selected</Badge> : null}
        </div>

        <h4 className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">The unit</h4>
        <SpecTable specs={modelSpecs(build.model)} />

        <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">As configured</h4>
        <SpecTable specs={buildSpecs(build, raid)} />

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Prices include GST and cover the unit and its drives. Installation and AMC, if you add them, come on top.
          {build.model.specsUrl ? (
            <>
              {" "}
              Specifications from{" "}
              <a href={build.model.specsUrl} target="_blank" rel="noreferrer noopener" className="font-medium text-accent underline-offset-2 hover:underline">
                {build.model.brand}
              </a>
              .
            </>
          ) : null}
        </p>
      </div>
      <div className="flex flex-col gap-2 border-t border-border bg-surface px-5 py-4 sm:flex-row">
        {chosen ? null : (
          <button type="button" className={btnPrimary} onClick={onChoose}>
            Choose this unit
          </button>
        )}
        <button type="button" className={btnSecondary} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export function CompareDialog({
  builds,
  raid,
  chosenId,
  onChoose,
  onClose,
}: {
  builds: Build[];
  raid: RaidLevel;
  chosenId: string | null;
  onChoose: (modelId: string) => void;
  onClose: () => void;
}) {
  const rows = compareRows(builds, raid);

  return (
    <Modal title={`Compare ${builds.length} recommended units`} onClose={onClose} wide>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="sticky left-0 z-10 bg-background px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
                Specification
              </th>
              {builds.map((b, i) => (
                <th key={b.model.id} scope="col" className={`px-4 py-3 align-bottom ${b.model.id === chosenId ? "bg-tint" : ""}`}>
                  <span className="font-display block text-sm font-bold tracking-tight text-foreground">{b.model.id}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {i === 0 ? <Badge tone="accent">Best value</Badge> : null}
                    {b.model.id === chosenId ? <Badge tone="tint">Selected</Badge> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-border last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-background px-5 py-2.5 text-left text-sm font-normal text-muted">
                  {r.label}
                </th>
                {r.values.map((v, i) => (
                  <td key={builds[i].model.id} className={`px-4 py-2.5 text-sm text-foreground ${builds[i].model.id === chosenId ? "bg-tint" : ""}`}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="sticky left-0 z-10 bg-background px-5 py-3 text-left text-sm font-normal text-muted">
                Total
              </th>
              {builds.map((b) => (
                <td key={b.model.id} className={`px-4 py-3 ${b.model.id === chosenId ? "bg-tint" : ""}`}>
                  <span className="font-display block text-base font-bold tabular-nums text-foreground">{inr(b.totalQuote)}</span>
                  {b.model.id === chosenId ? (
                    <span className="mt-1.5 block text-xs text-muted">Currently selected</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChoose(b.model.id)}
                      className="mt-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Choose
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="border-t border-border bg-surface px-5 py-3 text-xs leading-relaxed text-muted">
        Prices include GST and cover the unit and its drives at {builds[0]?.totalUsable} TB usable. Installation and AMC, if you add them, come on top.
      </p>
    </Modal>
  );
}
