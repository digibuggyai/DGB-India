import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/* Audit trail for the NAS configurator's price list: every add, edit and
 * removal is written to `nas-price-logs` with the signed-in user's email and
 * the fields that changed. The log is written in the same request (and
 * transaction) as the change, so a change can't land without its entry. */

type Doc = Record<string, unknown>;
type Change = { field: string; from: unknown; to: unknown };
type Entry = { action: "created" | "updated" | "deleted"; itemType: string; itemLabel: string; changes: Change[] };

type LogWriter = { create: (args: object) => Promise<unknown> };

// Bookkeeping fields, not something an admin changed.
const IGNORED = new Set(["id", "createdAt", "updatedAt", "title", "globalType"]);

const blank = (v: unknown) => (v === "" || v === undefined || (Array.isArray(v) && v.length === 0) ? null : v);
const same = (a: unknown, b: unknown) => JSON.stringify(blank(a)) === JSON.stringify(blank(b));

function diff(before: Doc | undefined, after: Doc | undefined): Change[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys]
    .filter((k) => !IGNORED.has(k) && !same(before?.[k], after?.[k]))
    .map((field) => ({ field, from: blank(before?.[field]), to: blank(after?.[field]) }));
}

async function write(req: PayloadRequest, entry: Entry) {
  const user = req.user as { email?: string; name?: string | null } | null | undefined;
  await (req.payload as unknown as LogWriter).create({
    collection: "nas-price-logs",
    data: { ...entry, userEmail: user?.email ?? "system", userName: user?.name ?? "" },
    overrideAccess: true,
    req,
  });
}

export function logChanges(itemType: string, label: (doc: Doc) => string) {
  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
    const changes = diff(operation === "create" ? undefined : previousDoc, doc);
    if (operation === "update" && !changes.length) return doc;
    await write(req, { action: operation === "create" ? "created" : "updated", itemType, itemLabel: label(doc), changes });
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    await write(req, { action: "deleted", itemType, itemLabel: label(doc), changes: diff(doc, undefined) });
    return doc;
  };

  return { afterChange: [afterChange], afterDelete: [afterDelete] };
}

export const logSettingsChange: GlobalAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const changes = diff(previousDoc, doc);
  if (changes.length) {
    await write(req, { action: "updated", itemType: "settings", itemLabel: "Installation & AMC", changes });
  }
  return doc;
};
