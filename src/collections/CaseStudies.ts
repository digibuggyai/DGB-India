import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

export const CaseStudies: CollectionConfig = {
  slug: "case-studies",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "industry", "publishedAt"],
    group: "Resources",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    { name: "clientName", type: "text" },
    {
      name: "clientAnonymous",
      type: "checkbox",
      defaultValue: false,
      admin: { description: 'Show as "A [City]-based [industry] studio" instead of the client name.' },
    },
    { name: "industry", type: "relationship", relationTo: "industries" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "summary", type: "textarea" },
    { name: "challenge", type: "richText" },
    { name: "approach", type: "richText" },
    {
      name: "infrastructureDeployed",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
    },
    {
      name: "results",
      type: "array",
      fields: [
        { name: "metric", type: "text", required: true },
        { name: "before", type: "text" },
        { name: "after", type: "text" },
      ],
    },
    {
      name: "quote",
      type: "group",
      fields: [
        { name: "text", type: "textarea" },
        { name: "person", type: "text" },
        { name: "role", type: "text" },
      ],
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
    seoField,
  ],
};
