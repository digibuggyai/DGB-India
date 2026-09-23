/* The half of the offer-code flow that only staff can see: that the enquiry is
 * filed as a lead, that marking a code used stamps the date, and that a
 * customer whose code has been spent gets a fresh one rather than the old one.
 *
 * Runs through the local API, so it isn't limited by the service account's
 * rights the way an HTTP test is. Everything it creates is deleted at the end.
 *
 *   npx tsx src/seed/check-offer-codes-staff.ts
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;
const FRONTEND = "http://localhost:3000";
const TAG = `staffcheck-${Date.now()}`;

let failures = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (!cond) failures++;
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${extra ? ` — ${extra}` : ""}`);
};

const ask = (body: Record<string, unknown>) =>
  fetch(`${FRONTEND}/api/nas-offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => (await r.json().catch(() => ({}))) as { code?: string; error?: string });

async function main() {
  const payload: any = await getPayload({ config });
  const email = `${TAG}@example.com`;
  const person = { name: "Staff Check", company: "Check Co", email, phone: "9000000001" };

  const first = await ask({ ...person, configuration: "40 TB usable, RAID 6, DS1525+" });
  check("a code is issued", Boolean(first.code), first.code ?? first.error ?? "");

  const leads = await payload.find({ collection: "leads", where: { email: { equals: email } }, overrideAccess: true, depth: 0 });
  check("the enquiry is filed as a lead", leads.docs.length === 1, String(leads.docs.length));
  check("tagged to the campaign", leads.docs[0]?.source?.utmCampaign === "consultation-offer", leads.docs[0]?.source?.utmCampaign);
  check("with what they were pricing", /RAID 6/.test(leads.docs[0]?.workloadDescription ?? ""), leads.docs[0]?.workloadDescription);

  const codes = await payload.find({ collection: "nas-offer-codes", where: { email: { equals: email } }, overrideAccess: true, depth: 0 });
  const code = codes.docs[0];
  check("the code is linked to that lead", code?.lead === leads.docs[0]?.id, `${code?.lead} vs ${leads.docs[0]?.id}`);
  check("the code starts outstanding, with no used date", code?.status === "issued" && !code?.usedAt);

  const used = await payload.update({ collection: "nas-offer-codes", id: code.id, data: { status: "used" }, overrideAccess: true });
  check("marking it used stamps the date by itself", used.status === "used" && Boolean(used.usedAt), String(used.usedAt));

  const reopened = await payload.update({ collection: "nas-offer-codes", id: code.id, data: { status: "issued" }, overrideAccess: true });
  check("reopening it clears the date again", reopened.status === "issued" && !reopened.usedAt, String(reopened.usedAt));

  await payload.update({ collection: "nas-offer-codes", id: code.id, data: { status: "used" }, overrideAccess: true });
  const second = await ask({ ...person });
  check("a customer whose code is spent gets a new one", Boolean(second.code) && second.code !== code.code, `${second.code} vs ${code.code}`);

  const all = await payload.find({ collection: "nas-offer-codes", where: { email: { equals: email } }, overrideAccess: true, depth: 0 });
  check("the spent code is kept on record beside the new one", all.docs.length === 2, String(all.docs.length));
  check("only one of them is outstanding", all.docs.filter((d: any) => d.status === "issued").length === 1);

  // Two codes are never the same.
  const everyCode = await payload.find({ collection: "nas-offer-codes", limit: 500, overrideAccess: true, depth: 0 });
  const seen = everyCode.docs.map((d: any) => d.code);
  check("every code on record is unique", new Set(seen).size === seen.length, `${seen.length} codes`);

  let removed = 0;
  for (const collection of ["nas-offer-codes", "leads"]) {
    const rows = await payload.find({ collection, where: { email: { like: TAG } }, limit: 100, overrideAccess: true, depth: 0 });
    for (const row of rows.docs) {
      await payload.delete({ collection, id: row.id, overrideAccess: true });
      removed++;
    }
  }
  console.log(`\nCleaned up ${removed} test records.`);

  console.log(failures ? `${failures} FAILED` : "All checks passed.");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
