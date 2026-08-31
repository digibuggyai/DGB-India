"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const key = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href.startsWith("//") ||
        link.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }
      if (href === window.location.pathname + window.location.search) return;
      setState("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const currentKey = `${pathname}?${searchParams.toString()}`;
    if (currentKey !== key.current) {
      key.current = currentKey;
      setState("done");
      const t = setTimeout(() => setState("idle"), 350);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams]);

  if (state === "idle") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent">
      <div
        className="h-full bg-accent shadow-[0_0_8px_var(--accent)]"
        style={{
          animation:
            state === "loading"
              ? "route-progress-grow 3s ease-out forwards"
              : "route-progress-finish 0.35s ease-out forwards",
        }}
      />
    </div>
  );
}
