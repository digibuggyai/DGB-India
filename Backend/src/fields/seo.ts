import type { Field } from "payload";

export const seoField: Field = {
  name: "seo",
  type: "group",
  admin: {
    position: "sidebar",
  },
  fields: [
    {
      name: "title",
      type: "text",
      admin: { description: "Overrides the default <title>. ~60 characters." },
    },
    {
      name: "description",
      type: "textarea",
      admin: { description: "Meta description. ~155 characters." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Social share image (1200x630)." },
    },
    {
      name: "noIndex",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
