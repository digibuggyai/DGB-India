import type { CollectionConfig } from "payload";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: {
    useAsTitle: "person",
    group: "Resources",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "person", type: "text", required: true },
    { name: "role", type: "text" },
    { name: "company", type: "text" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "industry", type: "relationship", relationTo: "industries" },
  ],
};
