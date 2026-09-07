import type { Access, CollectionConfig, FieldAccess } from "payload";

const isAdmin: Access = ({ req }) => req.user?.role === "admin";

// Admins see every account; anyone else is scoped to their own record.
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
    // Lets a service account (e.g. the Frontend's contact-form proxy) call
    // this API with `Authorization: users API-Key <key>` instead of a
    // cookie session — required now that Frontend is a separate origin.
    useAPIKey: true,
  },
  access: {
    // Accounts are created by an admin inside the CMS only — nothing on the
    // public site can create one. Without this, Payload's default ("any
    // authenticated request") let the contact-form service account POST
    // /api/users and mint itself a role: "admin" account.
    //
    // This does not block bootstrapping a fresh database: Payload's
    // registerFirstUser operation runs with overrideAccess and only works
    // while the collection is empty.
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
    // Service accounts exist to authenticate API writes; they should never
    // be able to open the CMS UI.
    admin: ({ req }) => Boolean(req.user && req.user.role !== "service"),
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
        // Only admins may set or change a role. `create` matters as much as
        // `update` here — restricting only `update` still allowed a caller
        // to pick role: "admin" at creation time.
        create: isAdminField,
        update: isAdminField,
      },
    },
  ],
};
