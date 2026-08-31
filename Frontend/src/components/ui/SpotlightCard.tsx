"use client";

import { useRef } from "react";
import type { ReactNode, MouseEvent } from "react";

export function SpotlightCard({
  children,
  className = "",
  as: Comp = "div",
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  href?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <Comp
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--accent) 15%, transparent), transparent 70%)",
        }}
      />
      <span className="relative z-10 flex h-full flex-col">{children}</span>
    </Comp>
  );
}
