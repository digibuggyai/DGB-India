import type { GlobalConfig } from "payload";

export const CTABlocks: GlobalConfig = {
  slug: "cta-blocks",
  admin: {
    group: "Site",
    description: "Reusable CTA copy so messaging can be edited in one place instead of on every page.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "blocks",
      type: "array",
      fields: [
        {
          name: "key",
          type: "text",
          required: true,
          admin: { description: 'e.g. "final-cta", "industry-cta", "infrastructure-cta"' },
        },
        { name: "heading", type: "text", required: true },
        { name: "subtext", type: "textarea" },
        { name: "primaryLabel", type: "text" },
        { name: "primaryHref", type: "text" },
        { name: "secondaryLabel", type: "text" },
        { name: "secondaryHref", type: "text" },
      ],
    },
  ],
};
