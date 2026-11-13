"use client";

import Image from "next/image";
import { useState } from "react";

export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`} aria-label="DGB India">
        <span className="font-display text-[1.4em] font-bold leading-none tracking-tight text-accent">DGB</span>
        <span className="text-[0.82em] font-semibold uppercase leading-none tracking-[0.22em] text-foreground">
          India
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/dgb_logo.png"
      alt="DGB India"
      width={1774}
      height={887}
      priority={priority}
      onError={() => setMissing(true)}
      className={className}
    />
  );
}
