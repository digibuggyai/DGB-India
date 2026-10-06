/* Does every change get recorded — and are secrets kept out of the record?
 *
 * Creates, edits and deletes one throwaway enquiry and one account, then reads
 * the log back. Deletion is the case that matters: it's the only action that
 * leaves nothing else behind to inspect.
 *
 *   npx tsx src/seed/check-activity-log.ts
 */
import "../../scripts/load-env.mts";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;
const TAG = `logcheck-${Date.now()}`;

let failures = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (!cond) failures++;
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${extra ? ` — ${extra}` : ""}`);
};

async function main() {
  const payload: any = await getPayload({ config });
  const since = new Date().toISOString();

  const entries = async (itemType: string) => {
    const r = await payload.find({
      collection: "nas-price-logs",
      where: { and: [{ itemType: { equals: itemType } }, { createdAt: { greater_than: since } }] },
      limit: 50,
      sort: "createdAt",
      overrideAccess: true,
      depth: 0,
    });
    return r.docs;
  };

  /* ---- an enquiry, through its whole life ---- */
  const lead = await payload.create({
    collection: "leads",
    data: { name: "Log Check", company: "Check Co", email: `${TAG}@example.com`, phone: "9000000002" },
    overrideAccess: true,
  });
  await payload.update({ collection: "leads", id: lead.id, data: { status: "contacted" }, overrideAccess: true });
  await payload.delete({ collection: "leads", id: lead.id, overrideAccess: true });

  const leadLog = await entries("lead");
  check("an enquiry's life is recorded in three entries", leadLog.length === 3, leadLog.map((e: any) => e.action).join(", "));
  check("the creation is recorded", leadLog[0]?.action === "created");
  check("the edit names the field that changed", leadLog[1]?.changes?.some((c: any) => c.field === "status"), JSON.stringify(leadLog[1]?.changes?.[0] ?? {}));
  check("the status change records both values", leadLog[1]?.changes?.some((c: any) => c.from === "new" && c.to === "contacted"));
  check("THE DELETION IS RECORDED", leadLog[2]?.action === "deleted", leadLog[2]?.action ?? "nothing logged");
  check("the deleted enquiry is still identifiable", leadLog[2]?.itemLabel?.includes("Log Check") && leadLog[2]?.itemId === lead.id, leadLog[2]?.itemLabel ?? "");
  check("the deletion keeps what was lost", leadLog[2]?.changes?.some((c: any) => c.field === "email" && String(c.from).includes(TAG)));
  check("the collection is recorded", leadLog[2]?.collection === "leads", leadLog[2]?.collection ?? "none");

  /* ---- an account: the same, but nothing secret may be written ---- */
  const user = await payload.create({
    collection: "users",
    data: { name: "Log Check", email: `${TAG}@dgbindia.local`, password: "a-very-long-test-password", role: "editor" },
    overrideAccess: true,
  });
  await payload.update({ collection: "users", id: user.id, data: { password: "another-very-long-password" }, overrideAccess: true });
  await payload.delete({ collection: "users", id: user.id, overrideAccess: true });

  const userLog = await entries("user");
  check("an account's life is recorded", userLog.length === 3, userLog.map((e: any) => e.action).join(", "));
  const everything = JSON.stringify(userLog);
  check("no password reaches the log", !/a-very-long-test-password|another-very-long-password/.test(everything));
  check("no hash or salt reaches the log", !/"hash":"\$|"salt":"[a-f0-9]{10}/.test(everything));
  const secretFields = userLog.flatMap((e: any) => (e.changes ?? []).filter((c: any) => ["password", "hash", "salt", "apiKey"].includes(c.field)));
  check("secret fields are listed but their values hidden", secretFields.every((c: any) => c.from === "(hidden)" && c.to === "(hidden)"), `${secretFields.length} secret fields seen`);

  /* ---- clean the log of this test ---- */
  const mine = await payload.find({
    collection: "nas-price-logs",
    where: { createdAt: { greater_than: since } },
    limit: 100,
    overrideAccess: true,
    depth: 0,
  });
  let removed = 0;
  for (const row of mine.docs) {
    if (String(row.itemLabel).includes("Log Check") || String(JSON.stringify(row.changes)).includes(TAG)) {
      await payload.delete({ collection: "nas-price-logs", id: row.id, overrideAccess: true });
      removed++;
    }
  }
  console.log(`\nRemoved ${removed} entries this test created.`);

  console.log(failures ? `${failures} FAILED` : "Every change is recorded, and no secret is.");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
