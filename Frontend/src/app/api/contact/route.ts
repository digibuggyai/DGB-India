import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !body.name || !body.company || !body.email) {
    return NextResponse.json({ error: "Name, company and email are required." }, { status: 400 });
  }

  const turnstileToken = body.turnstileToken as string | undefined;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
    const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
    }).then((r) => r.json());
    if (!verify.success) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
  }

  const apiKey = process.env.BACKEND_SERVICE_API_KEY;
  if (!apiKey) {
    console.error("BACKEND_SERVICE_API_KEY is not set — cannot create leads. See Frontend README.");
    return NextResponse.json({ error: "Something went wrong. Please try again shortly." }, { status: 500 });
  }

  const leadRes = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Service-account auth — see Backend's Users collection (useAPIKey)
      // and the Leads collection's `create` access rule.
      Authorization: `users API-Key ${apiKey}`,
    },
    body: JSON.stringify({
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone || undefined,
      industry: body.industry || undefined,
      interestedInfrastructure: body.interestedInfrastructure || undefined,
      workloadDescription: body.workloadDescription || undefined,
      applicationsUsed: body.applicationsUsed || undefined,
      companySize: body.companySize || undefined,
      message: body.message || undefined,
      source: {
        sourceUrl: body.sourceUrl || undefined,
        referrer: req.headers.get("referer") || undefined,
        utmSource: body.utmSource || undefined,
        utmMedium: body.utmMedium || undefined,
        utmCampaign: body.utmCampaign || undefined,
        utmTerm: body.utmTerm || undefined,
      },
    }),
  });

  if (!leadRes.ok) {
    const detail = await leadRes.text().catch(() => "");
    console.error("Lead creation failed:", leadRes.status, detail);
    return NextResponse.json({ error: "Something went wrong. Please try again shortly." }, { status: 502 });
  }

  const { doc: lead } = await leadRes.json();

  await notifyByEmail(lead).catch((err) => {
    console.error("Lead email notification failed:", err);
  });

  return NextResponse.json({ ok: true });
}

async function notifyByEmail(lead: { name: string; company: string; email: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Digibuggy Enterprise <leads@digibuggy.com>",
      to,
      subject: `New requirement: ${lead.company}`,
      text: `${lead.name} (${lead.company}, ${lead.email}) submitted a new requirement. View it in the CMS under Leads.`,
    }),
  });
}
