import type { FieldAccess, GlobalConfig } from "payload";
import { logSettingsChange } from "../hooks/nasPriceLog";

// Admins and sales staff: sales quote against the floor, so they can read it.
const staffOnly: FieldAccess = ({ req }) => req.user?.role === "admin" || req.user?.role === "sales";

/* Installation and AMC rates for the NAS configurator. The minimums are
 * readable by admins only. */
export const NasSettings: GlobalConfig = {
  slug: "nas-settings",
  label: "NAS Installation & AMC",
  admin: { group: "NAS Configurator" },
  hooks: { afterChange: [logSettingsChange] },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "installQuote",
      label: "Installation — quote (₹ per unit)",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "installMin",
      label: "Installation — minimum (₹ per unit)",
      type: "number",
      min: 0,
      access: { read: staffOnly },
    },
    {
      name: "amcQuotePercent",
      label: "AMC — quote (% of hardware)",
      type: "number",
      required: true,
      min: 0,
      max: 99,
    },
    {
      name: "amcMinPercent",
      label: "AMC — minimum (% of hardware)",
      type: "number",
      min: 0,
      max: 99,
      access: { read: staffOnly },
    },
  ],
};
