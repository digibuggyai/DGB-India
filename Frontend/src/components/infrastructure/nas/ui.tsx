import type { ReactNode } from "react";

/* Primitives for the NAS configurator, built from the site's own tokens: the
 * maroon accent marks the active choice, the blush tint is its ground, and
 * step numbers sit on ink. */

const focusRing =
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background";

const selected = "border-accent bg-tint shadow-[inset_0_0_0_1px_var(--accent)]";
const unselected = "border-border bg-background hover:border-border-strong";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimary = `${btnBase} bg-accent text-accent-foreground hover:bg-accent-hover disabled:hover:bg-accent`;
export const btnSecondary = `${btnBase} border border-border bg-background text-foreground hover:border-accent hover:text-accent`;
export const linkBtn = "font-medium text-accent underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none";
export const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export function Step({
  id,
  n,
  title,
  desc,
  className = "",
  children,
}: {
  id?: string;
  n: number;
  title: string;
  desc?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const titleId = `${id ?? `nas-step-${n}`}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={`scroll-mt-24 rounded-lg border border-border bg-background p-5 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-bold tabular-nums text-white"
        >
          {n}
        </span>
        <div className="min-w-0">
          <h3 id={titleId} className="font-display text-base font-bold tracking-tight text-foreground sm:text-[17px]">
            {title}
          </h3>
          {desc ? <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p> : null}
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

/** A radio choice. `row` lays title and subtitle side by side for list-style groups. */
export function Tile({
  name,
  checked,
  onSelect,
  title,
  sub,
  compact = false,
  row = false,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  title: ReactNode;
  sub?: ReactNode;
  compact?: boolean;
  row?: boolean;
}) {
  return (
    <label
      className={[
        "relative flex cursor-pointer rounded-lg border transition-colors",
        focusRing,
        row ? "flex-row items-center justify-between gap-3" : "flex-col",
        compact ? "px-3 py-2.5" : "px-4 py-3",
        checked ? selected : unselected,
      ].join(" ")}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="sr-only" />
      <span className={`text-sm font-semibold ${checked ? "text-tint-foreground" : "text-foreground"}`}>{title}</span>
      {sub ? (
        <span className={`${row ? "text-right" : "mt-0.5"} text-xs leading-snug ${checked ? "text-tint-muted" : "text-muted"}`}>{sub}</span>
      ) : null}
    </label>
  );
}

export function CheckTile({
  checked,
  onToggle,
  title,
  sub,
  aside,
}: {
  checked: boolean;
  onToggle: (next: boolean) => void;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${focusRing} ${checked ? selected : unselected}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border ${
          checked ? "border-accent bg-accent" : "border-border-strong bg-background"
        }`}
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6.25 5 8.5l4.5-5" />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${checked ? "text-tint-foreground" : "text-foreground"}`}>{title}</span>
        {sub ? <span className={`mt-0.5 block text-xs leading-snug ${checked ? "text-tint-muted" : "text-muted"}`}>{sub}</span> : null}
      </span>
      {aside ? <span className="shrink-0">{aside}</span> : null}
    </label>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
        on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

const BADGE = {
  outline: "border border-border bg-background text-muted",
  accent: "bg-accent text-accent-foreground",
  tint: "border border-accent/30 bg-background text-accent",
  dark: "bg-ink-800 text-white",
} as const;

export function Badge({ tone = "outline", children }: { tone?: keyof typeof BADGE; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${BADGE[tone]}`}>
      {children}
    </span>
  );
}

export function Field({
  id,
  label,
  required = false,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground/80">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>;
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}

/** Inline notice. Not a live region by default — derived notices change on every
 *  keystroke while a budget is typed, and shouldn't be announced each time. */
export function Alert({ tone, live = false, children }: { tone: "error" | "warn"; live?: boolean; children: ReactNode }) {
  const styles = tone === "error" ? "border-border-strong bg-tint text-tint-foreground" : "border-[#f2e0bd] bg-[#fdf3e3] text-[#6b4a10]";
  return (
    <p role={live ? "alert" : undefined} className={`rounded-md border px-3.5 py-2.5 text-sm leading-relaxed ${styles}`}>
      {children}
    </p>
  );
}
