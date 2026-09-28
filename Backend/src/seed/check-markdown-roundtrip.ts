/* Does a post survive the trip the blog editor puts it through?
 *
 * Markdown typed (or pasted) in the admin editor is converted to Lexical on
 * save and back to Markdown on read. Anything the editor's feature set doesn't
 * understand is dropped silently at the first step — which is how a pasted
 * comparison table used to disappear.
 *
 *   npx tsx src/seed/check-markdown-roundtrip.ts
 */
import "../../scripts/load-env.mts";
import { convertLexicalToMarkdown, convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";
import importedConfig from "../payload.config";
import { editorFeatures } from "@/lib/editorFeatures";

const config = (importedConfig as any)?.default ?? importedConfig;

let failures = 0;
const check = (name: string, cond: boolean, extra = "") => {
  if (!cond) failures++;
  console.log(`${cond ? "  ok  " : "FAIL  "}${name}${extra ? ` — ${extra}` : ""}`);
};

const SAMPLE = `## NAS vs Cloud Storage

Where should you store your files?

| | NAS | Cloud Storage |
| --- | --- | --- |
| Ownership | You own the hardware | Provider owns the servers |
| Initial cost | Higher | Low |
| Local access | Very fast | Depends on internet |

### Which one should you choose?

Choose cloud storage if you want:

- Simple setup
- No hardware to maintain
- Easy access from anywhere

1. Phone
2. NAS
3. Cloud backup

> A NAS is not automatically a backup.

**Bold** and *italic* and a [link](https://www.dgbindia.com/nas-config).`;

async function main() {
  const payload: any = await getPayload({ config });
  // Built from the same features as the field, which is the whole point.
  const editorConfig = await editorConfigFactory.fromFeatures({ config: payload.config, features: editorFeatures });

  const lexical = convertMarkdownToLexical({ editorConfig, markdown: SAMPLE });
  const back = convertLexicalToMarkdown({ data: lexical, editorConfig });

  console.log("\n--- after the round trip ---\n" + back + "\n");

  const types = new Set<string>();
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type) types.add(node.type);
    for (const child of node.children ?? []) walk(child);
  };
  walk((lexical as any).root);
  console.log("node types stored:", [...types].sort().join(", "), "\n");

  check("the table becomes a real table node", types.has("table"), [...types].join(", "));
  check("table rows are stored", types.has("tablerow"));
  check("table cells are stored", types.has("tablecell"));
  check("the table comes back as Markdown", /\|\s*Ownership\s*\|/.test(back), back.split("\n").find((l) => l.includes("Ownership")) ?? "missing");
  check("every table cell survives", ["You own the hardware", "Provider owns the servers", "Very fast", "Depends on internet"].every((s) => back.includes(s)));
  check("headings survive", /^## NAS vs Cloud Storage$/m.test(back) && /^### Which one should you choose\?$/m.test(back));
  check("bullets survive", (back.match(/^- /gm) ?? []).length === 3);
  check("numbered lists survive", /^1\. Phone$/m.test(back));
  check("the quote survives", /^> A NAS is not automatically a backup\.$/m.test(back));
  check("bold, italic and links survive", /\*\*Bold\*\*/.test(back) && /\*italic\*/.test(back) && /\[link\]\(https:\/\/www\.dgbindia\.com\/nas-config\)/.test(back));

  console.log(failures ? `\n${failures} FAILED` : "\nThe whole post survives the round trip.");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
