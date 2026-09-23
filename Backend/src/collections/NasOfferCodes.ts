import type { Access, CollectionConfig } from "payload";

const staffOnly: Access = ({ req }) => Boolean(req.user && (req.user.role === "admin" || req.user.role === "sales"));

/* Only the Frontend's offer route creates these, authenticating with the
 * service account's API key — the same arrangement the Leads collection uses.
 *
 * It reads them too, and has to: before issuing a code it checks whether this
 * customer already holds one, so that nobody can collect a fresh code by
 * filling the form again. That's why read isn't staff-only here, unlike Leads.
 * The only non-staff account is that service account, which is our own server;
 * there is no public signup. */
const trustedCaller: Access = ({ req }) => Boolean(req.user);

/* Discount codes handed out by the configurator's consultation offer.
 *
 * One code per customer, generated on the server: a code the browser made up
 * could be forged or handed round, and the sales team has to be able to answer
 * "is this code real, and is it this person's?" from the admin panel.
 *
 * Codes are never reissued or reused. When one is spent it's marked used,
 * which is what stops the same code being redeemed twice. */
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
      // Marking a code used records when, without anyone having to set the
      // date by hand; reopening it clears the date again.
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
  },
};
