import "server-only";

export type GuardResult = { ok: true } | { ok: false; reason: string; status: number };

export type GuardFields = {
  website?: unknown;
  openedAt?: unknown;
  turnstileToken?: unknown;
};

const MIN_SECONDS = 2.5;
const MAX_HOURS = 12;

const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(ip, hits);

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
    return true;
  }
}

export async function checkHuman(body: GuardFields, req: Request): Promise<GuardResult> {
  const ip = clientIp(req);

  if (rateLimited(ip)) {
    return { ok: false, reason: "Too many submissions from here. Wait a minute and try again.", status: 429 };
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: false, reason: "That didn't look like a person filling the form.", status: 400 };
  }

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
