import type { CollectionConfig } from "payload";

/* Who changed what in the NAS price list. Entries are written only by the
 * hooks in hooks/nasPriceLog.ts; nobody can create, edit or delete one through
 * the API or admin UI, and only admins can read them (they include minimums). */
export const NasPriceLogs: CollectionConfig = {
  slug: "nas-price-logs",
  labels: { singular: "Price change", plural: "Price change log" },
  admin: {
    useAsTitle: "itemLabel",
    group: "NAS Configurator",
    defaultColumns: ["createdAt", "userEmail", "action", "itemLabel"],
  },
  defaultSort: "-createdAt",
  access: {
    read: ({ req }) => req.user?.role === "admin",
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        { label: "Added", value: "created" },
        { label: "Updated", value: "updated" },
        { label: "Removed", value: "deleted" },
      ],
    },
    {
      name: "itemType",
      type: "select",
      required: true,
      options: [
        { label: "NAS model", value: "model" },
        { label: "Hard drive", value: "drive" },
        { label: "Upgrade", value: "upgrade" },
        { label: "Drive line specs", value: "driveLine" },
        { label: "Installation & AMC", value: "settings" },
      ],
    },
    { name: "itemLabel", label: "Item", type: "text", required: true },
    { name: "userEmail", label: "Changed by (email)", type: "text", required: true, index: true },
    { name: "userName", label: "Changed by (name)", type: "text" },
    { name: "changes", type: "json", admin: { description: "Each field that changed, with its old and new value." } },
  ],
};
