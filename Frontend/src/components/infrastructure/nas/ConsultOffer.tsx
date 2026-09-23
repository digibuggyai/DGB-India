"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Field, btnPrimary, btnSecondary, inputClass } from "./ui";

/* The consultation offer on the NAS configurator.
 *
 * Someone who has been configuring for half a minute is weighing a real
 * purchase and is the likeliest person on the site to want a word with us.
 * This offers that, with a reason to take it up.
 *
 * Everything the offer promises is in OFFER below, in one place, because it is
 * a promise: whatever this says, the sales team has to honour. Change the
 * wording or the amount here and the popup, the terms and the note that
 * reaches the lead all change together. */
const OFFER = {
  /** How long someone configures before we offer to help. Counted in time
   *  actually spent on the page, not wall-clock. */
  delaySeconds: 5,
  /** The most the coupon can be worth, in rupees. Must match /api/nas-offer,
   *  which is what actually issues the code. */
  maxOff: 2000,
  /** Once someone has asked for a consultation they hold a code, so there's
   *  nothing to offer them for a while. */
  rememberDaysAfterSending: 30,
  /** Closing it isn't a refusal for all time — just not now. */
  rememberDaysAfterClosing: 1,
};

/* Versioned, so that changing the rules below doesn't leave visitors sitting
 * behind a record written under the old ones. Bump the suffix whenever the
 * meaning of what's stored changes. */
const STORAGE_KEY = "dgb-nas-consult-offer.v2";

/* Forces the popup even for someone who has already seen it: add ?offer=1 to
 * the page's address. Closing it or sending it hides it for a month, which is
 * right for a visitor but makes it impossible to look at twice — this is how
 * you check it, and how you demonstrate it. */
function forced(): boolean {
  try {
    return new URLSearchParams(window.location.search).get("offer") === "1";
  } catch {
    return false;
  }
}

type Answer = { at: number; kind: "sent" | "closed" };

/* Whether to leave this visitor alone for now.
 *
 * Someone who asked for a consultation already has their code, so they're left
 * for a month. Someone who just closed it is asked again on their next visit a
 * day later — closing a popup means "not now", not "never".
 *
 * Browser storage can throw or come back empty — a private window, blocked site
 * data — and none of that should stop the page working, so any failure means
 * "show it". */
function answeredRecently(): boolean {
  if (forced()) return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const answer = JSON.parse(raw) as Answer;
    if (!answer || !Number.isFinite(answer.at)) return false;
    const days = answer.kind === "sent" ? OFFER.rememberDaysAfterSending : OFFER.rememberDaysAfterClosing;
    return Date.now() - answer.at < days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function remember(kind: Answer["kind"]) {
  // Don't record a forced viewing — it's a test, not a visitor's answer.
  if (forced()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), kind } satisfies Answer));
  } catch {
    /* nothing to do — it reappears on the next visit, which is no worse than before */
  }
}

type State = "idle" | "sending" | "sent";

export function ConsultOffer({ enabled, summary }: { enabled: boolean; summary: () => string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  /** The customer's own code, as issued by the server. */
  const [code, setCode] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* The wait is in time spent on the page, not wall-clock: a tab left open in
   * the background shouldn't come back to a popup already waiting. */
  useEffect(() => {
    if (!enabled || answeredRecently()) return;
    let elapsed = 0;
    let since = document.hidden ? null : Date.now();

    const tick = window.setInterval(() => {
      if (since != null) elapsed += Date.now() - since;
      since = document.hidden ? null : Date.now();
      if (elapsed >= OFFER.delaySeconds * 1000) {
        window.clearInterval(tick);
        setOpen(true);
      }
    }, 1000);

    const onVisibility = () => {
      if (document.hidden && since != null) {
        elapsed += Date.now() - since;
        since = null;
      } else if (!document.hidden && since == null) {
        since = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  // Closing it counts as an answer of "not now" — we ask again another day.
  function close() {
    remember("closed");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = form.name.trim();
    const company = form.company.trim();
    const email = form.email.trim();
    if (!name || !company || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please add your name, company and a valid work email.");
      return;
    }

    setError(null);
    setState("sending");
    try {
      // This files the enquiry and issues this customer their own code — the
      // code is made on the server, never here.
      const res = await fetch("/api/nas-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone: form.phone.trim() || undefined,
          // What they had configured, so whoever calls back already knows what
          // they were pricing — and the price match is judged on it.
          configuration: summary(),
          sourceUrl: window.location.href,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok || !body.code) throw new Error(body.error || "Something went wrong. Please try again.");
      remember("sent");
      setCode(body.code);
      setState("sent");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-800/50 backdrop-blur-[2px] sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-offer-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-[0_32px_64px_-32px_rgba(16,21,28,0.6)] sm:max-w-lg sm:rounded-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h3 id="consult-offer-title" className="font-display text-base font-bold tracking-tight text-foreground">
            {state === "sent" ? "We'll call you back" : "Not sure which NAS is right for you?"}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {state === "sent" ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground">
                Thanks — one of our storage engineers will call you within one working day to go through your options.
              </p>
              <div className="rounded-lg border border-border-strong bg-tint px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Your code</p>
                <p className="font-display mt-1 text-2xl font-bold tracking-tight text-tint-foreground">{code}</p>
                <p className="mt-0.5 text-xs text-muted">Yours alone — issued to {form.email.trim()}.</p>
                {/* No claim about an email here: the site doesn't send one, so
                    the code has to be worth keeping from this screen alone. */}
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Note it down or take a screenshot — quote it on your call for up to ₹{OFFER.maxOff.toLocaleString("en-IN")} off your
                  quotation. We have it against your enquiry either way.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>
                Back to the configurator
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <p className="text-sm leading-relaxed text-muted">
                Tell us what you&rsquo;re storing and we&rsquo;ll tell you honestly which unit fits — and which one you don&rsquo;t need to
                pay for. No obligation.
              </p>

              <ul className="space-y-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground">
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  <span>
                    A coupon worth up to <b className="font-semibold">₹{OFFER.maxOff.toLocaleString("en-IN")}</b> off your quotation.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">
                    ✓
                  </span>
                  <span>
                    Found the same configuration cheaper elsewhere? Show us the quote. If we can&rsquo;t beat it, your next{" "}
                    <b className="font-semibold text-accent">Starbucks coffee</b> is on us.
                  </span>
                </li>
              </ul>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="offer-name" label="Your name" required>
                  <input
                    id="offer-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    autoComplete="name"
                  />
                </Field>
                <Field id="offer-company" label="Company" required>
                  <input
                    id="offer-company"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className={inputClass}
                    autoComplete="organization"
                  />
                </Field>
                <Field id="offer-email" label="Work email" required>
                  <input
                    type="email"
                    id="offer-email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputClass}
                    autoComplete="email"
                  />
                </Field>
                <Field id="offer-phone" label="Phone">
                  <input
                    type="tel"
                    id="offer-phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </Field>
              </div>

              {error ? (
                <p role="alert" className="rounded-md border border-border-strong bg-tint px-3 py-2 text-sm text-tint-foreground">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="submit" disabled={state === "sending"} className={btnPrimary}>
                  {state === "sending" ? <Spinner className="h-4 w-4" /> : null}
                  {state === "sending" ? "Sending…" : "Get my coupon & a call back"}
                </button>
                <button type="button" onClick={close} className={btnSecondary}>
                  No thanks
                </button>
              </div>

              {/* The offer is a promise the sales team has to keep, so its limits
                  are stated here rather than left for the call. */}
              <p className="text-[11px] leading-relaxed text-muted">
                One coupon per customer, applied to your formal quotation and not combinable with other offers. The price match needs a
                written quote for the same unit, drives and RAID level, from a seller in India, valid on the day. If we can&rsquo;t beat
                it, we&rsquo;ll send you a ₹500 Starbucks voucher instead. Starbucks is not associated with this offer and doesn&rsquo;t
                sponsor it — we buy the voucher. Your details are used to contact you about this enquiry only.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
