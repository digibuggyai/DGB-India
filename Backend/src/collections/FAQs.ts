import type { CollectionConfig } from "payload";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  admin: {
    useAsTitle: "question",
    group: "Resources",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "richText", required: true },
    {
      name: "scope",
      type: "select",
      defaultValue: "global",
      options: [
        { label: "Global", value: "global" },
        { label: "Industry-specific", value: "industry" },
        { label: "Infrastructure-specific", value: "infrastructure" },
      ],
    },
  ],
};
