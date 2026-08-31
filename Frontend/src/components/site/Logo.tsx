export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="6" width="28" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="2" y="19" width="28" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="9.5" r="1.4" fill="var(--accent-2)" />
      <circle cx="7" cy="22.5" r="1.4" fill="var(--accent-2)" />
    </svg>
  );
}
