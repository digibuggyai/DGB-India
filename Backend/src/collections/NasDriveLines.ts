import type { Access, CollectionConfig } from "payload";
import { logChanges } from "@/hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const NasDriveLines: CollectionConfig = {
  slug: "nas-drive-lines",
  labels: { singular: "Drive line", plural: "Drive lines" },
  admin: {
    useAsTitle: "name",
    group: "NAS Configurator",
    defaultColumns: ["name", "brand", "driveClass", "workloadTbYear", "warrantyYears"],
  },
  defaultSort: "name",
  hooks: logChanges("driveLine", (doc) => String(doc.name)),
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
      admin: { description: 'Must match the drive line on the price list exactly, e.g. "Exos".' },
    },
    { name: "brand", type: "text", required: true, admin: { description: "Seagate, Western Digital, Synology…" } },
    {
      name: "driveClass",
      label: "Class",
      type: "select",
      required: true,
      defaultValue: "nas",
      options: [
        { label: "NAS", value: "nas" },
        { label: "Enterprise", value: "enterprise" },
      ],
    },
    {
      name: "madeForBrand",
      label: "Made for NAS brand",
      type: "text",
      admin: {
        description: 'Set only for a vendor’s own drives, e.g. "Synology". Used to flag drive-compatibility policies.',
      },
    },
    { name: "series", type: "text", admin: { description: 'Model family, e.g. "HAT5300 / HAT5320".' } },
    { name: "rpm", label: "Spindle speed", type: "text", admin: { description: 'e.g. "7,200 rpm" or "5,400–7,200 rpm".' } },
    { name: "cache", type: "text", admin: { description: 'e.g. "256 MB".' } },
    { name: "interface", type: "text", admin: { description: 'e.g. "SATA 6 Gb/s".' } },
    { name: "recording", type: "text", admin: { description: 'CMR or SMR — NAS arrays want CMR.' } },
    { name: "workloadTbYear", label: "Workload rating (TB/year)", type: "text" },
    { name: "mtbf", label: "MTBF / MTTF", type: "text", admin: { description: 'e.g. "2.5 million hours".' } },
    { name: "warrantyYears", label: "Warranty (years)", type: "number", min: 0 },
    { name: "bestFor", type: "textarea", admin: { description: "One line on where this drive belongs." } },
    { name: "extras", type: "text", admin: { description: 'Anything included, e.g. "3 years Rescue Data Recovery".' } },
    { name: "specsUrl", label: "Manufacturer spec page", type: "text", admin: { description: "Where these figures came from." } },
    { name: "sortOrder", type: "number", admin: { position: "sidebar", description: "Lower numbers list first." } },
  ],
};
