// Imports the articles in ./posts as DRAFTS, ready for review in the site's
// admin Blog tab. Nothing is published: an admin reads each one and publishes it.
//
// Run only once the deployed backend has the Markdown support in Posts.ts —
// the import relies on its hook to turn Markdown into the CMS's rich text.
//
// Safe to re-run: a post whose slug already exists is left untouched, so edits
// made after the first import are never overwritten.
import "../../scripts/load-env.mts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;
const POSTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "posts");

const AUTHOR = { name: "DGB India Team", role: "Infrastructure engineering" };

type Draft = { title: string; slug: string; type: "blog" | "insight"; tags: string[]; excerpt: string; body: string };

/** A small front-matter reader: `key: value` lines between two `---` lines. */
function parse(file: string): Draft {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${path.basename(file)}: missing front matter`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of ["title", "slug", "type", "excerpt"]) {
    if (!meta[key]) throw new Error(`${path.basename(file)}: front matter needs "${key}"`);
  }

  return {
    title: meta.title,
    slug: meta.slug,
    type: meta.type === "insight" ? "insight" : "blog",
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    excerpt: meta.excerpt,
    body: match[2].trim(),
  };
}

async function main() {
  const payload: any = await getPayload({ config });

  const existingAuthor = await payload.find({ collection: "authors", where: { name: { equals: AUTHOR.name } }, limit: 1, overrideAccess: true });
  const author = existingAuthor.docs[0] ?? (await payload.create({ collection: "authors", data: AUTHOR, overrideAccess: true }));

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")).sort();
  let created = 0;
  const skipped: string[] = [];

  for (const file of files) {
    const draft = parse(path.join(POSTS_DIR, file));
    const found = await payload.find({ collection: "posts", where: { slug: { equals: draft.slug } }, limit: 1, overrideAccess: true });
    if (found.docs.length) {
      skipped.push(draft.slug);
      continue;
    }

    const post = await payload.create({
      collection: "posts",
      overrideAccess: true,
      data: {
        title: draft.title,
        slug: draft.slug,
        type: draft.type,
        excerpt: draft.excerpt,
        bodyMarkdown: draft.body,
        tags: draft.tags.map((tag) => ({ tag })),
        author: author.id,
        publishedAt: null, // a draft until someone reviews and publishes it
      },
    });
    console.log(`  + ${draft.type.padEnd(7)} ${draft.title}  (${post.readingMinutes ?? "?"} min read)`);
    created++;
  }

  console.log(`\nImported ${created} draft${created === 1 ? "" : "s"} by "${author.name}".`);
  if (skipped.length) console.log(`Already in the CMS, left as they are: ${skipped.join(", ")}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
