export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
      <span className="h-px w-6 bg-accent" />
      {children}
    </span>
  );
}
