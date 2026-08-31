import type { CollectionConfig } from "payload";

export const Partners: CollectionConfig = {
  slug: "partners",
  admin: {
    useAsTitle: "name",
    group: "Resources",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    {
      name: "tier",
      type: "select",
      options: [
        { label: "OEM", value: "oem" },
        { label: "Partner", value: "partner" },
        { label: "Distributor", value: "distributor" },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
      admin: { description: "Which infrastructure categories this partner is relevant to." },
    },
  ],
};
