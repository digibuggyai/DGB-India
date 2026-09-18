import type { Access, CollectionConfig, FieldAccess } from "payload";
import { logChanges } from "../hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";
// Admins and sales staff: sales quote against the floor, so they can read it.
const staffOnly: FieldAccess = ({ req }) => req.user?.role === "admin" || req.user?.role === "sales";

/* NAS units the configurator (/nas-config) can quote.
 *
 * Anyone can read these — the public configurator does — but `minPrice` is
 * readable by admins only, so an anonymous REST request never receives it. */
export const NasModels: CollectionConfig = {
  slug: "nas-models",
  admin: {
    useAsTitle: "model",
    group: "NAS Configurator",
    defaultColumns: ["model", "brand", "bays", "quotePrice", "active"],
  },
  defaultSort: "bays",
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: logChanges("model", (doc) => String(doc.model)),
  fields: [
    { name: "model", type: "text", required: true, unique: true },
    { name: "brand", type: "text", required: true },
    { name: "bays", type: "number", required: true, min: 1 },
    {
      name: "raid",
      type: "select",
      hasMany: true,
      required: true,
      options: ["RAID0", "RAID1", "RAID5", "RAID6", "RAID10"],
    },
    {
      name: "expandable",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Takes an expansion unit for more drives later." },
    },
    { name: "network", type: "text", admin: { description: "Built-in ports, e.g. \"2.5GbE ×2\"." } },
    { name: "networkUpgrade", type: "text", admin: { description: "Optional upgrade path, e.g. \"10GbE via PCIe card\"." } },

    /* Detailed specifications, shown on the configurator's model cards. All
     * optional: a unit with none of them still quotes, it just shows less. Keep
     * them as the manufacturer words them — they are quoted to customers. */
    { name: "cpu", label: "Processor", type: "text", admin: { description: "e.g. \"AMD Ryzen V1500B\"." } },
    { name: "cpuCores", label: "Cores", type: "text", admin: { description: "e.g. \"4 cores / 8 threads, 2.2 GHz\"." } },
    { name: "memory", label: "Memory (installed)", type: "text", admin: { description: "e.g. \"4 GB DDR4 ECC\"." } },
    { name: "memoryMax", label: "Memory (maximum)", type: "text", admin: { description: "e.g. \"32 GB\"." } },
    { name: "m2Slots", label: "M.2 NVMe slots", type: "number", min: 0 },
    {
      name: "maxDriveTb",
      label: "Largest drive supported (TB)",
      type: "number",
      min: 0,
      admin: { description: "Per-drive ceiling for this unit. The configurator will not quote a bigger drive in it." },
    },
    { name: "baysWithExpansion", label: "Bays with expansion units", type: "number", min: 0, admin: { description: "Total bays once expansion units are attached. Leave blank if it takes none." } },
    { name: "maxRawTb", label: "Maximum raw capacity (TB)", type: "number", min: 0 },
    { name: "usbPorts", label: "USB ports", type: "text" },
    { name: "dimensions", type: "text", admin: { description: "H × W × D in mm." } },
    { name: "weightKg", label: "Weight (kg)", type: "number", min: 0 },
    { name: "warranty", type: "text", admin: { description: "e.g. \"3 years, extendable to 5\"." } },
    { name: "specsUrl", label: "Manufacturer spec page", type: "text", admin: { description: "Where these specifications came from." } },
    {
      name: "quotePrice",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "GST-inclusive price customers are quoted (₹)." },
    },
    {
      name: "minPrice",
      type: "number",
      min: 0,
      access: { read: staffOnly },
      admin: { description: "With-tax minimum (₹). Admins only — never sent to the public site." },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide from the configurator." } },
  ],
};
