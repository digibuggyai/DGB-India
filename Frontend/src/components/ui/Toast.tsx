"use client";

import { useEffect, useState } from "react";

/* A brief message in the corner of the screen reporting the outcome of
 * something the person just did. Errors are announced to screen readers and
 * stay long enough to read; successes are short, since the page moves on. */

export type ToastKind = "success" | "error";

const STYLES: Record<ToastKind, { border: string; badge: string }> = {
  success: { border: "border-[#cbe7d3]", badge: "bg-[#e6f4ea] text-[#1e4d2b]" },
  error: { border: "border-border-strong", badge: "bg-tint text-accent" },
};

export function Toast({
  kind,
  message,
  onClose,
  duration,
}: {
  kind: ToastKind;
  message: string;
  onClose: () => void;
  /** Milliseconds before it closes itself. Omit to leave it until dismissed. */
  duration?: number;
}) {
  const [shown, setShown] = useState(false);
  const style = STYLES[kind];

  // Paint once off-screen, then transition in, so the slide is actually seen.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!duration) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-lg border bg-background p-4 shadow-[0_24px_48px_-24px_rgba(16,21,28,0.45)] transition duration-300 motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:w-80 ${style.border} ${
        shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.badge}`}>
        {kind === "success" ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5 6.5 11.5 12.5 5" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M8 4v5M8 11.5v.5" />
          </svg>
        )}
      </span>
      <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="m5 5 10 10M15 5 5 15" />
        </svg>
      </button>
    </div>
  );
}
