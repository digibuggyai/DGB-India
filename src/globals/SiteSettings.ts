import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Site" },
  access: { read: () => true },
  fields: [
    { name: "siteName", type: "text", defaultValue: "Digibuggy Enterprise" },
    { name: "tagline", type: "text", defaultValue: "Your Workload. Our Infrastructure." },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "logoDark", type: "upload", relationTo: "media" },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "email", type: "email" },
        { name: "phone", type: "text" },
        { name: "address", type: "textarea" },
      ],
    },
    {
      name: "social",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: ["linkedin", "twitter", "youtube", "instagram"],
        },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "defaultSeo",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};
