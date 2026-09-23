import { randomInt } from "crypto";
import { NextResponse } from "next/server";

/* The configurator's consultation offer: files the enquiry as a lead and
 * issues that customer their own discount code.
 *
 * The code is made here rather than in the browser. A code the page invented
 * could be forged or shared around, and the sales team has to be able to look
 * one up and see whose it is and whether it's been spent — so it exists as a
 * record in the CMS before the customer is ever shown it.
 *
 * Someone who asks twice gets the code they already have back, rather than a
 * second one. */

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

/** The most a code can take off, in rupees. Mirrors the popup's own copy. */
const VALUE_MAX = 2000;

/* No 0/O/1/I/5/S: these are read aloud over the phone and typed back in.
 * 32 characters, six of them — about a billion codes, so a guess is hopeless
 * and a clash is rare enough that three tries always finds a free one. */
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

  const apiKey = process.env.BACKEND_SERVICE_API_KEY;
  if (!apiKey) {
    console.error("BACKEND_SERVICE_API_KEY is not set — cannot issue offer codes. See Frontend README.");
    return NextResponse.json({ error: "Something went wrong. Please try again shortly." }, { status: 500 });
  }

  try {
    // Already has a live code? Give them that one back rather than a second.
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

    /* A clash is improbable but not impossible, and `code` is unique in the
     * CMS — so a rejected code is retried rather than handed to the customer. */
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
