import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

export const Industries: CollectionConfig = {
  slug: "industries",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
    group: "Content Graph",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "tagline", type: "text" },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "heroCopy", type: "richText" },
    {
      name: "challenges",
      type: "array",
      label: "Industry Challenges",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
    {
      name: "workloads",
      type: "relationship",
      relationTo: "workloads",
      hasMany: true,
      label: "Typical Workloads",
    },
    {
      name: "featuredApplications",
      type: "relationship",
      relationTo: "applications",
      hasMany: true,
      label: "Applications / Software",
    },
    {
      name: "requirementsNarrative",
      type: "richText",
      label: "Infrastructure Requirements (narrative)",
      admin: {
        description:
          "Explain why this industry needs what it needs. Structured per-workload requirements come from each linked Workload's requirement profile.",
      },
    },
    {
      name: "recommendedInfrastructure",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
      label: "Recommended Solutions",
    },
    {
      name: "possibleArchitecture",
      type: "group",
      fields: [
        { name: "description", type: "richText" },
        { name: "diagram", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "caseStudies",
      type: "relationship",
      relationTo: "case-studies",
      hasMany: true,
    },
    {
      name: "faqs",
      type: "relationship",
      relationTo: "faqs",
      hasMany: true,
    },
    seoField,
  ],
};
