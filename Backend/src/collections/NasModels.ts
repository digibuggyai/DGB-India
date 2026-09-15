import type { Access, CollectionConfig, FieldAccess } from "payload";
import { logChanges } from "../hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";
const adminOnly: FieldAccess = ({ req }) => req.user?.role === "admin";

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
      access: { read: adminOnly },
      admin: { description: "With-tax minimum (₹). Admins only — never sent to the public site." },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide from the configurator." } },
  ],
};
