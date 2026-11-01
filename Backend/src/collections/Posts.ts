import type { Access, CollectionBeforeChangeHook, CollectionConfig, FieldHook } from "payload";
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";

import { editorFeatures } from "@/lib/editorFeatures";
import { checkJsonLd } from "@/lib/jsonLd";
import { logChanges } from "@/hooks/nasPriceLog";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

const MAX_FAQS = 30;

const validateSchemaJson = (value: string | null | undefined) => {
  const result = checkJsonLd(String(value ?? ""));
  return result.ok ? true : result.error;
};

const readPublished: Access = ({ req }) =>
  req.user ? true : { publishedAt: { less_than_equal: new Date().toISOString() } };

const canWrite: Access = ({ req }) => req.user?.role === "admin" || req.user?.role === "editor";

let editorConfigPromise: ReturnType<typeof editorConfigFactory.fromFeatures> | null = null;
const editorConfigFor = (config: Parameters<typeof editorConfigFactory.default>[0]["config"]) =>
  (editorConfigPromise ??= editorConfigFactory.fromFeatures({ config, features: editorFeatures }));

const wordCount = (markdown: string) => markdown.split(/\s+/).filter(Boolean).length;

const syncBody: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const editorConfig = await editorConfigFor(req.payload.config);

  const markdownChanged =
    typeof data.bodyMarkdown === "string" && data.bodyMarkdown !== (originalDoc?.bodyMarkdown ?? "");
  const bodyChanged = data.body !== undefined && JSON.stringify(data.body) !== JSON.stringify(originalDoc?.body ?? null);

  if (markdownChanged) {
    data.body = data.bodyMarkdown.trim() ? convertMarkdownToLexical({ editorConfig, markdown: data.bodyMarkdown }) : null;
  } else if (bodyChanged) {
    data.bodyMarkdown = data.body ? convertLexicalToMarkdown({ data: data.body, editorConfig }) : "";
  }

  const markdown: string = data.bodyMarkdown ?? originalDoc?.bodyMarkdown ?? "";
  const words = wordCount(markdown);
  data.readingMinutes = words ? Math.max(1, Math.round(words / 200)) : null;
  return data;
};

const markdownFromBody: FieldHook = async ({ value, siblingData, req }) => {
  if (value || !siblingData?.body) return value;
  try {
    const editorConfig = await editorConfigFor(req.payload.config);
    return convertLexicalToMarkdown({ data: siblingData.body, editorConfig });
  } catch {
    return value;
  }
};

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "publishedAt"],
    group: "Resources",
  },
  access: {
    read: readPublished,
    create: canWrite,
    update: canWrite,
    delete: canWrite,
  },
  hooks: {
    beforeChange: [syncBody],
    ...logChanges("post", (doc) => String(doc.title)),
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "blog",
      options: [
        { label: "Blog", value: "blog" },
        { label: "Insight", value: "insight" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "excerpt", type: "textarea" },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText" },
    {
      name: "bodyMarkdown",
      type: "textarea",
      admin: { hidden: true },
      hooks: { afterRead: [markdownFromBody] },
    },
    {
      name: "readingMinutes",
      type: "number",
      admin: { readOnly: true, position: "sidebar", description: "Worked out from the length of the post." },
    },
    { name: "author", type: "relationship", relationTo: "authors" },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "relatedIndustries",
      type: "relationship",
      relationTo: "industries",
      hasMany: true,
    },
    {
      name: "relatedInfrastructure",
      type: "relationship",
      relationTo: "infrastructure",
      hasMany: true,
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Leave empty to keep it a draft. A future date schedules it.",
      },
    },
    {
      name: "faqs",
      type: "array",
      maxRows: MAX_FAQS,
      labels: { singular: "FAQ", plural: "FAQs" },
      admin: {
        description:
          "Shown as a questions block at the end of the post and sent to Google as FAQPage schema. Google only accepts the markup when the answers are visible on the page, which is why both happen together.",
      },
      fields: [
        { name: "question", type: "text", required: true, maxLength: 300 },
        { name: "answer", type: "textarea", required: true, maxLength: 2000 },
      ],
    },
    {
      name: "schemaJson",
      label: "Custom schema (JSON-LD)",
      type: "textarea",
      validate: validateSchemaJson,
      admin: {
        description:
          "Extra structured data for this post — HowTo, Product, VideoObject and so on. One object or a list of them. BlogPosting and breadcrumb schema are added automatically and don't belong here.",
      },
    },
    seoField,
  ],
};
