import type { Access, CollectionConfig, FieldAccess } from "payload";
import { logChanges } from "../hooks/nasPriceLog";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";
// Admins and sales staff: sales quote against the floor, so they can read it.
const staffOnly: FieldAccess = ({ req }) => req.user?.role === "admin" || req.user?.role === "sales";

/* Optional per-unit add-ons offered in the configurator: RAM kits and network
 * cards. Nothing here is checked for compatibility — that's a sales call. */
export const NasUpgrades: CollectionConfig = {
  slug: "nas-upgrades",
  admin: {
    useAsTitle: "name",
    group: "NAS Configurator",
    defaultColumns: ["name", "category", "quotePrice", "active"],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: logChanges("upgrade", (doc) => String(doc.name)),
  fields: [
    { name: "sku", type: "text", required: true, unique: true },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        { label: "RAM", value: "RAM" },
        { label: "Network card", value: "NIC" },
      ],
    },
    { name: "name", type: "text", required: true },
    { name: "brand", type: "text" },
    { name: "spec", type: "text", admin: { description: "For network cards, include the speed, e.g. \"10GbE\"." } },
    {
      name: "quotePrice",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "GST-inclusive price per unit (₹)." },
    },
    {
      name: "minPrice",
      type: "number",
      min: 0,
      access: { read: staffOnly },
      admin: { description: "With-tax minimum (₹). Admins only." },
    },
    { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide from the configurator." } },
  ],
};
