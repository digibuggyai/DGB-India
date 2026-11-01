"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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

export function useHumanFields() {
  const [token, setToken] = useState("");
  const [website, setWebsite] = useState("");
  const openedAt = useRef(Date.now());

  return {
    fields: (): HumanFields => ({ website, openedAt: openedAt.current, turnstileToken: token }),
    token,
    setToken,
    website,
    setWebsite,
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
          <div ref={box} className="empty:hidden" />
        </>
      ) : null}
    </>
  );
}
