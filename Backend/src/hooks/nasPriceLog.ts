import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/* Audit trail for everything staff can change: price list, posts, enquiries,
 * images, accounts and discount codes. Every add, edit and removal is written
 * with the signed-in user's email and the fields that changed.
 *
 * The entry is written in the same request (and transaction) as the change, so
 * a change cannot land without its record. Deletions matter most: they are the
 * one action that leaves nothing behind to inspect afterwards. */

type Doc = Record<string, unknown>;
type Change = { field: string; from: unknown; to: unknown };
type Entry = {
  action: "created" | "updated" | "deleted";
  itemType: string;
  itemLabel: string;
  changes: Change[];
  collection?: string;
  itemId?: number | null;
};

type LogWriter = { create: (args: object) => Promise<unknown> };

// Bookkeeping fields, not something an admin changed.
const IGNORED = new Set(["id", "createdAt", "updatedAt", "title", "globalType"]);

/* Never written to the log, whatever changes.
 *
 * A log is read by more people than the record it describes, and it outlives
 * it. A password hash or an API key copied into one would be a credential
 * sitting in a table meant for browsing. The field is recorded as changed; its
 * value is not. */
const SECRET = new Set(["password", "hash", "salt", "apiKey", "apiKeyIndex", "resetPasswordToken", "resetPasswordExpiration", "sessions"]);

/* Long text is recorded as a length rather than in full: an article body would
 * otherwise copy the whole post into the log on every save. */
const summarise = (value: unknown) =>
  typeof value === "string" && value.length > 300 ? `(${value.length} characters)` : value;

const blank = (v: unknown) => (v === "" || v === undefined || (Array.isArray(v) && v.length === 0) ? null : v);
const same = (a: unknown, b: unknown) => JSON.stringify(blank(a)) === JSON.stringify(blank(b));

function diff(before: Doc | undefined, after: Doc | undefined): Change[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  return [...keys]
    .filter((k) => !IGNORED.has(k) && !same(before?.[k], after?.[k]))
    .map((field) =>
      SECRET.has(field)
        ? { field, from: "(hidden)", to: "(hidden)" }
        : { field, from: summarise(blank(before?.[field])), to: summarise(blank(after?.[field])) },
    );
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

export function logChanges(itemType: string, label: (doc: Doc) => string, collection?: string) {
  const id = (doc: Doc) => (typeof doc.id === "number" ? doc.id : null);

  const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req, collection: c }) => {
    const changes = diff(operation === "create" ? undefined : previousDoc, doc);
    if (operation === "update" && !changes.length) return doc;
    await write(req, {
      action: operation === "create" ? "created" : "updated",
      itemType,
      itemLabel: label(doc),
      changes,
      collection: collection ?? c?.slug,
      itemId: id(doc),
    });
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req, collection: c }) => {
    await write(req, {
      action: "deleted",
      itemType,
      itemLabel: label(doc),
      changes: diff(doc, undefined),
      collection: collection ?? c?.slug,
      itemId: id(doc),
    });
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
