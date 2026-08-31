import type { Access, CollectionConfig } from "payload";

const staffOnly: Access = ({ req }) =>
  Boolean(req.user && (req.user.role === "admin" || req.user.role === "sales"));

// Any authenticated request may create a lead — in practice this is only
// ever the Frontend app's /api/contact route, authenticating with a service
// account's API key (Authorization: users API-Key <key>). There's no public
// session-based signup, so "authenticated" here effectively means "trusted
// server-to-server caller," not "any logged-in user."
const authenticatedOnly: Access = ({ req }) => Boolean(req.user);

export const Leads: CollectionConfig = {
  slug: "leads",
  admin: {
    useAsTitle: "company",
    defaultColumns: ["name", "company", "industry", "status", "createdAt"],
    group: "Leads",
  },
  access: {
    create: authenticatedOnly,
    read: staffOnly,
    update: staffOnly,
    delete: ({ req }) => req.user?.role === "admin",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "company", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "industry", type: "relationship", relationTo: "industries" },
    { name: "interestedInfrastructure", type: "relationship", relationTo: "infrastructure", hasMany: true },
    { name: "workloadDescription", type: "textarea" },
    { name: "applicationsUsed", type: "text" },
    {
      name: "companySize",
      type: "select",
      options: ["1-10", "11-50", "51-200", "201-500", "500+"],
    },
    { name: "message", type: "textarea" },
    {
      name: "source",
      type: "group",
      admin: { position: "sidebar" },
      fields: [
        { name: "sourceUrl", type: "text" },
        { name: "referrer", type: "text" },
        { name: "utmSource", type: "text" },
        { name: "utmMedium", type: "text" },
        { name: "utmCampaign", type: "text" },
        { name: "utmTerm", type: "text" },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      admin: { position: "sidebar" },
      options: ["new", "contacted", "qualified", "proposal", "won", "lost"],
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "internalNotes",
      type: "array",
      fields: [
        { name: "note", type: "textarea", required: true },
        { name: "author", type: "relationship", relationTo: "users" },
        { name: "date", type: "date", defaultValue: () => new Date().toISOString() },
      ],
    },
  ],
};
