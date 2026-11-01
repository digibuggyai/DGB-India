import type { Access, CollectionConfig, FieldAccess } from "payload";

import { logChanges } from "@/hooks/nasPriceLog";
const isAdmin: Access = ({ req }) => req.user?.role === "admin";

const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;
  return { id: { equals: req.user.id } };
};

const isAdminField: FieldAccess = ({ req }) => req.user?.role === "admin";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
    admin: ({ req }) => Boolean(req.user && req.user.role !== "service"),
  },
  hooks: logChanges("user", (doc) => `${doc.email} (${doc.role})`),
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
        create: isAdminField,
        update: isAdminField,
      },
    },
  ],
};
