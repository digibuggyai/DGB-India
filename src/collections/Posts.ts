import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "publishedAt"],
    group: "Resources",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "blog",
      options: [
        { label: "Blog", value: "blog" },
        { label: "Insight", value: "insight" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "excerpt", type: "textarea" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText" },
    { name: "author", type: "relationship", relationTo: "authors" },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "relatedIndustries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
    },
    {
      name: "relatedInfrastructure",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
    },
    { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
    seoField,
  ],
};
