import type { Access, CollectionConfig } from "payload";
import { logChanges } from "@/hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";

/* The specifications of a hard drive family — IronWolf, Exos, WD Ultrastar and
 * so on — shown in the configurator's drive step.
 *
 * Specs live here rather than on each priced drive because they belong to the
 * line, not the capacity: every Exos is a 550 TB/year enterprise drive whether
 * it holds 8 TB or 20 TB. `name` is what links a line to the drives on the
 * price list, so it must match their drive line exactly.
 *
 * Figures are as the manufacturer publishes them, with a link to the source.
 * Where a line spans a range — Synology's Plus drives spin at two speeds — the
 * range is written out rather than averaged. */
export const NasDriveLines: CollectionConfig = {
  slug: "nas-drive-lines",
  labels: { singular: "Drive line", plural: "Drive lines" },
  admin: {
    useAsTitle: "name",
    group: "NAS Configurator",
    defaultColumns: ["name", "brand", "driveClass", "workloadTbYear", "warrantyYears"],
  },
  defaultSort: "name",
  // Spec edits go in the same change log as price edits, with the editor’s email.
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
