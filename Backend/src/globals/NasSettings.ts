import type { FieldAccess, GlobalConfig } from "payload";
import { logSettingsChange } from "../hooks/nasPriceLog";

const adminOnly: FieldAccess = ({ req }) => req.user?.role === "admin";

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
      access: { read: adminOnly },
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
      access: { read: adminOnly },
    },
  ],
};
