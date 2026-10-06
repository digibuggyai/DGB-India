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
        { label: "Blog post", value: "post" },
        { label: "Enquiry", value: "lead" },
        { label: "Image", value: "media" },
        { label: "Account", value: "user" },
        { label: "Offer code", value: "offerCode" },
      ],
    },
    { name: "itemLabel", label: "Item", type: "text", required: true },
    { name: "collection", label: "Collection", type: "text", index: true, admin: { description: "Where the item lived, e.g. leads." } },
    {
      name: "itemId",
      label: "Item id",
      type: "number",
      admin: { description: "The record's id. Kept so a deleted item can still be traced." },
    },
    { name: "userEmail", label: "Changed by (email)", type: "text", required: true, index: true },
    { name: "userName", label: "Changed by (name)", type: "text" },
    { name: "changes", type: "json", admin: { description: "Each field that changed, with its old and new value." } },
  ],
};
