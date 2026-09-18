import { APIError, type Access, type CollectionConfig, type FieldAccess } from "payload";
import { logChanges } from "../hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";
// Admins and sales staff: sales quote against the floor, so they can read it.
const staffOnly: FieldAccess = ({ req }) => req.user?.role === "admin" || req.user?.role === "sales";

type DriveLike = { id?: number | string; capacityTb?: number; line?: string } | undefined;
type DriveFinder = {
  find: (args: object) => Promise<{ docs: { id: number | string }[] }>;
};

/* Hard drives the configurator can quote — one row per capacity + drive line
 * (e.g. 10 TB IronWolf). `minPrice` is admin-only, like the other NAS items. */
export const NasDrives: CollectionConfig = {
  slug: "nas-drives",
  admin: {
    useAsTitle: "title",
    group: "NAS Configurator",
    defaultColumns: ["title", "quotePrice", "active"],
  },
  defaultSort: "capacityTb",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    ...logChanges("drive", (doc) => `${doc.capacityTb} TB ${doc.line}`),
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const previous = originalDoc as DriveLike;
        const capacityTb = data?.capacityTb ?? previous?.capacityTb;
        const line = String(data?.line ?? previous?.line ?? "").trim();

        // Two rows for the same size and line would make the price ambiguous.
        const existing = await (req.payload as unknown as DriveFinder).find({
          collection: "nas-drives",
          where: {
            and: [
              { capacityTb: { equals: capacityTb } },
              { line: { equals: line } },
              ...(previous?.id != null ? [{ id: { not_equals: previous.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          req,
        });
        if (existing.docs.length) throw new APIError(`A ${capacityTb} TB ${line} drive already exists.`, 400);

        return { ...data, title: `${capacityTb} TB ${line}` };
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    { name: "capacityTb", label: "Capacity (TB)", type: "number", required: true, min: 1 },
    { name: "line", type: "text", required: true, admin: { description: "Drive line, e.g. Exos, IronWolf, WD Ultrastar." } },
    {
      name: "quotePrice",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "GST-inclusive price per drive (₹)." },
    },
    {
      name: "minPrice",
      type: "number",
      min: 0,
      access: { read: staffOnly },
      admin: { description: "With-tax minimum per drive (₹). Admins only." },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide from the configurator." } },
  ],
};
