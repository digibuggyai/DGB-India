import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Workloads: CollectionConfig = {
  slug: "workloads",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "updatedAt"],
    group: "Content Graph",
    description:
      "The hub of the content graph: Industry -> Workload -> Application -> Requirement -> Infrastructure.",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "description", type: "textarea" },
    {
      name: "applications",
      type: "relationship",
      relationTo: "applications",
      hasMany: true,
    },
    {
      name: "requirementProfile",
      type: "group",
      label: "Infrastructure Requirement Profile",
      fields: [
        {
          name: "cpuIntensity",
          type: "select",
          options: ["low", "medium", "high", "extreme"],
        },
        {
          name: "gpuIntensity",
          type: "select",
          options: ["none", "low", "medium", "high", "extreme"],
        },
        { name: "vramMinGB", type: "number", admin: { description: "Minimum VRAM per GPU, in GB." } },
        { name: "ramMinGB", type: "number", admin: { description: "Minimum system RAM, in GB." } },
        {
          name: "storageType",
          type: "select",
          options: ["hdd", "sata-ssd", "nvme-ssd", "nvme-raid", "parallel-fs"],
        },
        {
          name: "storageThroughput",
          type: "text",
          admin: { description: 'e.g. "3+ GB/s sustained read"' },
        },
        {
          name: "networkMin",
          type: "select",
          options: ["1gbe", "10gbe", "25gbe", "100gbe", "infiniband"],
        },
        {
          name: "scalingPattern",
          type: "select",
          options: ["single-workstation", "scale-up", "scale-out-cluster", "hybrid-cloud-burst"],
        },
      ],
    },
    {
      name: "recommendedInfrastructure",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
    },
    {
      name: "industries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
      admin: { description: "Industries where this workload commonly appears." },
    },
  ],
};
