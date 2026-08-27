import type { Field } from "payload";

const formatSlug = (val: string): string =>
  val
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const slugField = (sourceField = "name"): Field => ({
  name: "slug",
  type: "text",
  unique: true,
  index: true,
  admin: {
    position: "sidebar",
    description: "Auto-generated from the title/name. Edit to override.",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (value) return formatSlug(value);
        const source = data?.[sourceField];
        if (source && typeof source === "string") return formatSlug(source);
        return value;
      },
    ],
  },
});
