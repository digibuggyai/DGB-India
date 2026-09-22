import type { Access, CollectionBeforeChangeHook, CollectionConfig, FieldHook } from "payload";
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { slugField } from "@/fields/slug";
import { seoField } from "@/fields/seo";

/* Blog and insight posts.
 *
 * A post can be written two ways: in the CMS's rich-text editor (`body`), or as
 * Markdown from the site's own admin panel (`bodyMarkdown`). The hooks below
 * keep the two in step, so whichever was edited last is the one both show —
 * nobody has to know which tool the other person used. */

// Published means "the publish date has arrived". Signed-in staff also see
// drafts (no date) and scheduled posts (a date still to come).
const readPublished: Access = ({ req }) =>
  req.user ? true : { publishedAt: { less_than_equal: new Date().toISOString() } };

// Writing is for admins and editors — not sales or the site's service account.
const canWrite: Access = ({ req }) => req.user?.role === "admin" || req.user?.role === "editor";

// The converter needs the editor's configuration; building it once per process
// is plenty, since it only depends on the Payload config.
let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null;
const editorConfigFor = (config: Parameters<typeof editorConfigFactory.default>[0]["config"]) =>
  (editorConfigPromise ??= editorConfigFactory.default({ config }));

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
  // About 200 words a minute for technical reading.
  data.readingMinutes = words ? Math.max(1, Math.round(words / 200)) : null;
  return data;
};

// Posts written before Markdown support have a body but no Markdown. Fill it in
// on read, so the site's editor never opens one of them blank and wipes it.
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
      // The CMS uses the rich editor above; this is the site admin's copy.
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
    seoField,
  ],
};
