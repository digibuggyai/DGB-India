export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
      <span className="h-px w-6 bg-accent-2" />
      {children}
    </span>
  );
}
