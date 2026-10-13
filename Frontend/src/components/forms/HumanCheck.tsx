"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/* The customer-facing half of the spam guard.
 *
 * Nothing here asks anybody to do anything. The honeypot and the timestamp are
 * invisible, and Cloudflare Turnstile in managed mode resolves itself for
 * almost everyone — a checkbox occasionally, a puzzle never.
 *
 * With no site key configured the widget simply isn't rendered and the other
 * two checks carry on, so the forms keep working exactly as they do today. */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/* Whether the widget shows itself.
 *
 *   "always"           — the familiar Cloudflare box on every form. Visitors can
 *                        see that the form is protected, and so can you.
 *   "interaction-only" — invisible unless Cloudflare wants a confirmation.
 *
 * The checking is identical either way; this is only what the visitor sees. */
const APPEARANCE: "always" | "interaction-only" = "always";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

export type HumanFields = { website: string; openedAt: number; turnstileToken: string };

/** Everything the form should send alongside its own fields. */
export function useHumanFields() {
  const [token, setToken] = useState("");
  const [website, setWebsite] = useState("");
  // Fixed once, when the form first renders: this is what makes the timing check work.
  const openedAt = useRef(Date.now());

  return {
    fields: (): HumanFields => ({ website, openedAt: openedAt.current, turnstileToken: token }),
    token,
    setToken,
    website,
    setWebsite,
    /** True while Turnstile is configured but hasn't produced a token yet. */
    waiting: Boolean(SITE_KEY) && !token,
  };
}

export function HumanCheck({
  website,
  onWebsite,
  onToken,
}: {
  website: string;
  onWebsite: (v: string) => void;
  onToken: (token: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !ready || !box.current || widget.current) return;
    widget.current =
      window.turnstile?.render(box.current, {
        sitekey: SITE_KEY,
        appearance: APPEARANCE,
        theme: "light",
        callback: (t: string) => onToken(t),
        "error-callback": () => onToken(""),
        "expired-callback": () => onToken(""),
      }) ?? null;

    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [ready, onToken]);

  return (
    <>
      {/* The honeypot. Hidden from sight and from screen readers, skipped by the
          keyboard, and never autofilled — so only a script ever puts anything
          in it. */}
      <div aria-hidden className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden" style={{ opacity: 0 }}>
        <label htmlFor="website-url">Leave this field empty</label>
        <input
          id="website-url"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => onWebsite(e.target.value)}
        />
      </div>

      {SITE_KEY ? (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="lazyOnload"
            onLoad={() => setReady(true)}
          />
          {/* The widget itself. With APPEARANCE "always" this is the familiar
              Cloudflare box; set to interaction-only it takes no space unless
              a confirmation is wanted. */}
          <div ref={box} className="empty:hidden" />
        </>
      ) : null}
    </>
  );
}
