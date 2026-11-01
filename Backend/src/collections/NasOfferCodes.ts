import type { Access, CollectionConfig } from "payload";
import { logChanges } from "@/hooks/nasPriceLog";

const staffOnly: Access = ({ req }) => Boolean(req.user && (req.user.role === "admin" || req.user.role === "sales"));

const trustedCaller: Access = ({ req }) => Boolean(req.user);

export const NasOfferCodes: CollectionConfig = {
  slug: "nas-offer-codes",
  labels: { singular: "Offer code", plural: "Offer codes" },
  admin: {
    useAsTitle: "code",
    group: "Leads",
    defaultColumns: ["code", "customerName", "company", "status", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: {
    create: trustedCaller,
    read: trustedCaller,
    update: staffOnly,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Generated when the customer asks for it. Don't edit — a changed code won't match what they were shown." },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "issued",
      options: [
        { label: "Issued", value: "issued" },
        { label: "Used", value: "used" },
        { label: "Void", value: "void" },
      ],
      index: true,
    },
    { name: "valueMax", label: "Worth up to (₹)", type: "number", min: 0 },
    { name: "customerName", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "email", type: "email", required: true, index: true },
    { name: "phone", type: "text" },
    { name: "lead", type: "relationship", relationTo: "leads", admin: { description: "The enquiry this code was issued against." } },
    {
      name: "configuration",
      type: "textarea",
      admin: { description: "What they had configured when they asked — so the price match is judged against the right build." },
    },
    { name: "sourceUrl", type: "text" },
    { name: "usedAt", label: "Redeemed on", type: "date" },
    { name: "notes", type: "textarea", admin: { description: "What it was redeemed against, or why it was voided." } },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.status === "used" && originalDoc?.status !== "used" && !data.usedAt) {
          return { ...data, usedAt: new Date().toISOString() };
        }
        if (data.status && data.status !== "used" && originalDoc?.status === "used") {
          return { ...data, usedAt: null };
        }
        return data;
      },
    ],
    ...logChanges("offerCode", (doc) => `${doc.code} — ${doc.customerName}`),
  },
};
