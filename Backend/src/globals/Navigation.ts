import type { GlobalConfig } from "payload";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  admin: {
    group: "Site",
    description:
      "The Industries and Infrastructure mega-menus are generated live from those collections, so a new industry or product shows up in the nav automatically. Use this global for the footer and any extra top-level links.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "footerColumns",
      type: "array",
      fields: [
        { name: "heading", type: "text", required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "footerNote",
      type: "textarea",
      admin: { description: "e.g. copyright / CIN / registered office line." },
    },
  ],
};
