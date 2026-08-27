import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Applications: CollectionConfig = {
  slug: "applications",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "vendor", "category"],
    group: "Content Graph",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "vendor", type: "text" },
    {
      name: "category",
      type: "select",
      options: [
        { label: "3D / Rendering", value: "3d-rendering" },
        { label: "Simulation", value: "simulation" },
        { label: "Compositing / VFX", value: "compositing-vfx" },
        { label: "CAD / BIM", value: "cad-bim" },
        { label: "AI / ML", value: "ai-ml" },
        { label: "Trading / Quant", value: "trading-quant" },
        { label: "Media Editing", value: "media-editing" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "logo", type: "upload", relationTo: "media" },
    {
      name: "workloads",
      type: "relationship",
      relationTo: "workloads",
      hasMany: true,
    },
    {
      name: "optimisationNotes",
      type: "textarea",
      admin: {
        description:
          'What this application is bottlenecked by, e.g. "Redshift is VRAM-bound and scales near-linearly across GPUs."',
      },
    },
    {
      name: "certifiedHardware",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
      admin: { description: "Infrastructure this application is certified/optimized for." },
    },
  ],
};
