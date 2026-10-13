import "server-only";

/* Keeping bots out of the enquiry forms.
 *
 * Three layers, lightest first, because a real customer should never be asked
 * to prove anything:
 *
 *   1. A honeypot field. It is invisible to a person and irresistible to a
 *      form-filling script. Costs nothing and catches most of them.
 *   2. How long the form was open. A person needs seconds to type a name and
 *      an email; a script posts in milliseconds.
 *   3. Cloudflare Turnstile, in managed mode: usually invisible, occasionally a
 *      single checkbox, never a puzzle about traffic lights.
 *
 * Every layer is optional and fails open. With no Turnstile key configured the
 * first two still run, and the form keeps working — which is how the site runs
 * today, so switching this on can't break anything that was working.
 */

export type GuardResult = { ok: true } | { ok: false; reason: string; status: number };

/** The hidden fields every protected form sends. */
export type GuardFields = {
  /** The honeypot. Anything in it means a script filled the form. */
  website?: unknown;
  /** When the form was rendered, as epoch milliseconds. */
  openedAt?: unknown;
  /** Cloudflare's token, when Turnstile is switched on. */
  turnstileToken?: unknown;
};

/** A person cannot fill in a form faster than this. */
const MIN_SECONDS = 2.5;
/** Nor usually slower than this; a day-old page is likely a replayed payload. */
const MAX_HOURS = 12;

/* One submission every few seconds per address is plenty for a human. The
 * counter lives in memory, so on a serverless host it only sees the requests
 * that land on the same instance — it slows a flood rather than stopping one,
 * and the layers above do the real work. */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(ip, hits);

  // Keep the map from growing without bound on a long-lived instance.
  if (recent.size > 5000) {
    for (const [key, times] of recent) {
      if (!times.some((t) => now - t < RATE_LIMIT.windowMs)) recent.delete(key);
    }
  }
  return hits.length > RATE_LIMIT.max;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

async function turnstileOk(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    /* Cloudflare unreachable. Turning real customers away because a third party
     * is down costs more than the occasional bot, so this fails open. */
    return true;
  }
}

/**
 * Decides whether a submission looks human. The messages are deliberately plain
 * — a bot never reads them, and a person who trips a check needs to know what
 * to do next.
 */
export async function checkHuman(body: GuardFields, req: Request): Promise<GuardResult> {
  const ip = clientIp(req);

  if (rateLimited(ip)) {
    return { ok: false, reason: "Too many submissions from here. Wait a minute and try again.", status: 429 };
  }

  // 1. The honeypot: a person never sees this field, so anything in it is a bot.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: false, reason: "That didn't look like a person filling the form.", status: 400 };
  }

  // 2. How long the form was open.
  const openedAt = Number(body.openedAt);
  if (Number.isFinite(openedAt) && openedAt > 0) {
    const seconds = (Date.now() - openedAt) / 1000;
    if (seconds < MIN_SECONDS) {
      return { ok: false, reason: "That was submitted too quickly. Try again.", status: 400 };
    }
    if (seconds > MAX_HOURS * 3600) {
      return { ok: false, reason: "This page has been open a long time. Reload it and try again.", status: 400 };
    }
  }

  // 3. Turnstile, only when it is configured.
  if (process.env.TURNSTILE_SECRET_KEY) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    if (!token) {
      return { ok: false, reason: "The human check didn't finish. Reload the page and try again.", status: 400 };
    }
    if (!(await turnstileOk(token, ip))) {
      return { ok: false, reason: "The human check failed. Reload the page and try again.", status: 400 };
    }
  }

  return { ok: true };
}
