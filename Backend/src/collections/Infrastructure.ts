import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

export const Infrastructure: CollectionConfig = {
  slug: "infrastructure",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "parent"],
    group: "Content Graph",
    description:
      "Infrastructure categories and products, e.g. Compute > GPU Servers. Keep URLs flat; use `parent` for the mega-menu hierarchy.",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "Compute", value: "compute" },
        { label: "Storage", value: "storage" },
        { label: "Networking", value: "networking" },
        { label: "Data Protection", value: "data-protection" },
      ],
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "infrastructure",
      admin: {
        description:
          "Optional. Set for sub-items, e.g. GPU Servers' parent is the Compute category entry.",
      },
    },
    {
      name: "summary",
      type: "textarea",
      admin: { description: "Short card/teaser copy (~160 chars)." },
    },
    { name: "overview", type: "richText" },
    {
      name: "useCases",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
    {
      name: "capabilities",
      type: "array",
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "businessValue",
      type: "array",
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "suitedWorkloads",
      type: "relationship",
      relationTo: "workloads",
      hasMany: true,
    },
    {
      name: "relatedIndustries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
    },
    { name: "heroImage", type: "upload", relationTo: "media" },
    seoField,
  ],
};
