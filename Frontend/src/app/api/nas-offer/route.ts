import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { checkHuman, clientIp } from "@/lib/spam-guard";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

const VALUE_MAX = 2000;

const ALPHABET = "ABCDEFGHJKLMNPQRTUVWXYZ2346789";

function newCode(): string {
  let body = "";
  for (let i = 0; i < 6; i++) body += ALPHABET[randomInt(ALPHABET.length)];
  return `DGB-${body}`;
}

function auth(apiKey: string) {
  return { "Content-Type": "application/json", Authorization: `users API-Key ${apiKey}` };
}

async function cms(path: string, apiKey: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: auth(apiKey),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`CMS ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data as Record<string, any>;
}

const str = (v: unknown) => String(v ?? "").trim();

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = str(body?.name);
  const company = str(body?.company);
  const email = str(body?.email).toLowerCase();
  const phone = str(body?.phone);
  const configuration = str(body?.configuration);

  if (!name || !company || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Name, company and a valid work email are required." }, { status: 400 });
  }

  const human = await checkHuman((body ?? {}) as Record<string, unknown>, req);
  if (!human.ok) {
    console.warn("[nas-offer] rejected a submission:", human.reason, "from", clientIp(req));
    return NextResponse.json({ error: human.reason }, { status: human.status });
  }

  const apiKey = process.env.BACKEND_SERVICE_API_KEY;
  if (!apiKey) {
    console.error("BACKEND_SERVICE_API_KEY is not set — cannot issue offer codes. See Frontend README.");
    return NextResponse.json({ error: "Something went wrong. Please try again shortly." }, { status: 500 });
  }

  try {
    const existing = await cms(
      `/nas-offer-codes?where[email][equals]=${encodeURIComponent(email)}&where[status][equals]=issued&limit=1&depth=0`,
      apiKey,
    );
    if (existing.docs?.length) {
      return NextResponse.json({ code: existing.docs[0].code, valueMax: existing.docs[0].valueMax ?? VALUE_MAX, reissued: true });
    }

    const lead = await cms("/leads", apiKey, {
      method: "POST",
      body: JSON.stringify({
        name,
        company,
        email,
        phone: phone || undefined,
        workloadDescription: configuration || undefined,
        message: "Asked for a consultation from the NAS configurator. An offer code was issued — see Offer codes.",
        source: {
          sourceUrl: str(body?.sourceUrl) || undefined,
          referrer: req.headers.get("referer") || undefined,
          utmSource: "nas-configurator",
          utmCampaign: "consultation-offer",
        },
      }),
    });

    let issued: string | null = null;
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3 && !issued; attempt++) {
      const code = newCode();
      try {
        await cms("/nas-offer-codes", apiKey, {
          method: "POST",
          body: JSON.stringify({
            code,
            status: "issued",
            valueMax: VALUE_MAX,
            customerName: name,
            company,
            email,
            phone: phone || undefined,
            lead: lead.doc?.id ?? lead.id,
            configuration: configuration || undefined,
            sourceUrl: str(body?.sourceUrl) || undefined,
          }),
        });
        issued = code;
      } catch (err) {
        lastError = err;
      }
    }

    if (!issued) throw lastError ?? new Error("could not issue a code");
    return NextResponse.json({ code: issued, valueMax: VALUE_MAX });
  } catch (err) {
    console.error("[nas-offer]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
}
