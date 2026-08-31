import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    // Lets a service account (e.g. the Frontend's contact-form proxy) call
    // this API with `Authorization: users API-Key <key>` instead of a
    // cookie session — required now that Frontend is a separate origin.
    useAPIKey: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Sales", value: "sales" },
        { label: "Service Account", value: "service" },
      ],
      access: {
        // only admins can change roles
        update: ({ req }) => req.user?.role === "admin",
      },
    },
  ],
};
