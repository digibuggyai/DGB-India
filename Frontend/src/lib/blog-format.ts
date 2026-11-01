export type FormatResult = {
  markdown: string;
  changes: string[];
  warnings: string[];
};

const clean = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[ \t]+$/gm, "");

const tidyBlankLines = (s: string) => s.replace(/\n{3,}/g, "\n\n").trim();

const escapeInline = (s: string) => s.replace(/([*_`[\]])/g, "\\$1");

const BLOCK = new Set([
  "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE",
  "PRE", "HR", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "SECTION", "ARTICLE", "BR",
]);

const isBold = (el: Element) => {
  const weight = (el as HTMLElement).style?.fontWeight;
  if (weight === "normal" || weight === "400") return false;
  if (/^(B|STRONG)$/.test(el.tagName)) return true;
  return weight === "bold" || (/^\d+$/.test(weight ?? "") && Number(weight) >= 600);
};

const wrapsBlocks = (el: Element): boolean =>
  [...el.children].some((c) => BLOCK.has(c.tagName) || wrapsBlocks(c));

const isItalic = (el: Element) => /^(I|EM)$/.test(el.tagName) || (el as HTMLElement).style?.fontStyle === "italic";

type Ctx = { images: number; tables: number };

function inline(node: Node, ctx: Ctx): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeInline((node.textContent ?? "").replace(/\s+/g, " "));
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  if (/^(SCRIPT|STYLE|HEAD|META|LINK|NOSCRIPT)$/.test(el.tagName)) return "";
  if (el.tagName === "BR") return "\n";

  if (el.tagName === "IMG") {
    const mediaId = el.getAttribute("data-media-id");
    if (mediaId && /^\d+$/.test(mediaId)) return `![media:${mediaId}]()`;
    ctx.images++;
    return "";
  }

  const inner = [...el.childNodes].map((c) => inline(c, ctx)).join("");
  if (!inner.trim()) return inner.trim() ? inner : "";

  if (el.tagName === "CODE" || el.tagName === "TT") return `\`${inner.replace(/\\([*_`[\]])/g, "$1")}\``;
  if (el.tagName === "A") {
    const href = (el as HTMLAnchorElement).getAttribute("href") ?? "";
    if (!/^(https?:|mailto:|\/)/i.test(href)) return inner;
    return `[${inner}](${href})`;
  }
  if (/^(DEL|S|STRIKE)$/.test(el.tagName)) return `~~${inner}~~`;
  if (isBold(el) && isItalic(el)) return `***${inner}***`;
  if (isBold(el)) return `**${inner}**`;
  if (isItalic(el)) return `*${inner}*`;
  return inner;
}

function block(el: Element, ctx: Ctx, depth = 0): string {
  const tag = el.tagName;

  if (/^H[1-6]$/.test(tag)) {
    const text = inline(el, ctx).trim();
    if (!text) return "";
    const level = Math.max(2, Number(tag[1]));
    return `${"#".repeat(level)} ${text}`;
  }

  if (tag === "UL" || tag === "OL") {
    const ordered = tag === "OL";
    const items: string[] = [];
    let index = 1;
    for (const li of [...el.children].filter((c) => c.tagName === "LI")) {
      const nested = [...li.children].filter((c) => c.tagName === "UL" || c.tagName === "OL");
      const own = [...li.childNodes].filter((c) => !(c.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test((c as Element).tagName)));
      const text = own.map((c) => inline(c, ctx)).join("").trim();
      const marker = ordered ? `${index++}. ` : "- ";
      const pad = "  ".repeat(depth);
      if (text) items.push(pad + marker + text);
      for (const child of nested) {
        const sub = block(child, ctx, depth + 1);
        if (sub) items.push(sub);
      }
    }
    return items.join("\n");
  }

  if (tag === "BLOCKQUOTE") {
    const inner = children(el, ctx, depth);
    return inner
      .split("\n")
      .map((l) => (l.trim() ? `> ${l}` : ">"))
      .join("\n");
  }

  if (tag === "PRE") {
    const code = (el.textContent ?? "").replace(/\n+$/, "");
    return code.trim() ? "```\n" + code + "\n```" : "";
  }

  if (tag === "HR") return "---";

  if (tag === "TABLE") {
    ctx.tables++;
    const rows = [...el.querySelectorAll("tr")];
    if (!rows.length) return "";
    const cells = (tr: Element) => [...tr.children].map((c) => inline(c, ctx).replace(/\|/g, "\\|").trim());
    const head = cells(rows[0]);
    const body = rows.slice(1).map(cells);
    const line = (c: string[]) => `| ${c.join(" | ")} |`;
    return [line(head), `| ${head.map(() => "---").join(" | ")} |`, ...body.map(line)].join("\n");
  }

  if (BLOCK.has(tag)) {
    const inner = children(el, ctx, depth);
    return inner.trim();
  }

  return inline(el, ctx).trim();
}

function children(el: Element, ctx: Ctx, depth = 0): string {
  const out: string[] = [];
  let run = "";

  const flush = () => {
    if (run.trim()) out.push(run.trim());
    run = "";
  };

  for (const node of [...el.childNodes]) {
    const isElement = node.nodeType === Node.ELEMENT_NODE;
    if (isElement && BLOCK.has((node as Element).tagName)) {
      flush();
      const md = block(node as Element, ctx, depth);
      if (md) out.push(md);
    } else if (isElement && wrapsBlocks(node as Element)) {
      flush();
      const md = children(node as Element, ctx, depth);
      if (md) out.push(md);
    } else {
      run += inline(node, ctx);
    }
  }
  flush();
  return out.join("\n\n");
}

export function editorHtmlToMarkdown(html: string): string {
  return htmlToMarkdown(html).markdown;
}

export function htmlToMarkdown(html: string): FormatResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, head, meta, link").forEach((n) => n.remove());

  const ctx: Ctx = { images: 0, tables: 0 };
  const markdown = tidyBlankLines(clean(children(doc.body, ctx)))
    .replace(/^(\d{1,2}[.)])(?=\S)/gm, "$1 ");

  const changes: string[] = [];
  const warnings: string[] = [];
  const count = (re: RegExp) => (markdown.match(re) ?? []).length;
  const headings = count(/^#{2,6} /gm);
  const bullets = count(/^\s*[-\d]+[.)]? /gm);
  if (headings) changes.push(`${headings} heading${headings === 1 ? "" : "s"}`);
  if (bullets) changes.push(`${bullets} list item${bullets === 1 ? "" : "s"}`);
  if (/\*\*/.test(markdown)) changes.push("bold text");
  if (/\[[^\]]+\]\(/.test(markdown)) changes.push("links");
  if (ctx.images) warnings.push(`${ctx.images} image${ctx.images === 1 ? " was" : "s were"} left out — add ${ctx.images === 1 ? "it" : "them"} with Insert image so ${ctx.images === 1 ? "it's" : "they're"} stored with the post.`);
  if (ctx.tables) warnings.push(`${ctx.tables} table${ctx.tables === 1 ? "" : "s"} converted — check ${ctx.tables === 1 ? "it reads" : "they read"} correctly.`);

  return { markdown, changes, warnings };
}

const BULLET_GLYPH = /^[\s]*[•●▪‣·◦*–—-]\s+/;
const NUMBERED = /^[\s]*(\d{1,2})[.)]\s+/;
const ENDS_SENTENCE = /[.!?:;,]$/;

const isTabRow = (line: string) => line.includes("\t") && line.split("\t").filter((c) => c.trim()).length >= 2;

function tabbedTable(rows: string[]): string {
  const cells = rows.map((r) => r.split("\t").map((c) => c.trim().replace(/\|/g, "\\|")));
  const width = Math.max(...cells.map((c) => c.length));
  const pad = (c: string[]) => [...c, ...Array(width - c.length).fill("")];
  const line = (c: string[]) => `| ${pad(c).join(" | ")} |`;
  return [line(cells[0]), `| ${Array(width).fill("---").join(" | ")} |`, ...cells.slice(1).map(line)].join("\n");
}

function looksLikeMarkdown(lines: string[]): boolean {
  const meaningful = lines.filter((l) => l.trim());
  if (!meaningful.length) return false;
  const marked = meaningful.filter((l) => /^(#{1,6} |[-*+] |\d+[.)] |> |```|\|)/.test(l.trim())).length;
  return marked / meaningful.length >= 0.25;
}

function isHeading(line: string, next: string | undefined): boolean {
  const t = line.trim();
  if (!t || t.length > 70) return false;
  const words = t.split(/\s+/).length;
  if (words < 2 || words > 12) return false;
  if ((t.match(/[?!.]/g) ?? []).length > 1) return false;
  if (/[.,;:]$/.test(t)) return false;
  if (!next || !next.trim()) return false;
  return t.endsWith("?") || !ENDS_SENTENCE.test(t);
}

export function tidyPlainText(text: string, title = ""): FormatResult {
  const lines = clean(text).split("\n");
  const changes: string[] = [];
  const warnings: string[] = [];

  if (looksLikeMarkdown(lines)) {
    return { markdown: tidyBlankLines(lines.join("\n")), changes: ["spacing"], warnings };
  }

  const blocks: string[] = [];
  let i = 0;

  const listish = (l: string) => {
    const t = l.trim();
    return Boolean(t) && !BULLET_GLYPH.test(t) && !NUMBERED.test(t) && t.length <= 60 && !ENDS_SENTENCE.test(t) && !t.endsWith("?");
  };

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) {
      i++;
      continue;
    }

    if (isTabRow(lines[i])) {
      const rows: string[] = [];
      while (i < lines.length && isTabRow(lines[i])) {
        rows.push(lines[i]);
        i++;
      }
      blocks.push(tabbedTable(rows));
      continue;
    }

    if (BULLET_GLYPH.test(t) || NUMBERED.test(t)) {
      const items: string[] = [];
      while (i < lines.length && (BULLET_GLYPH.test(lines[i].trim()) || NUMBERED.test(lines[i].trim()))) {
        const raw = lines[i].trim();
        const numbered = raw.match(NUMBERED);
        items.push(numbered ? `${numbered[1]}. ${raw.replace(NUMBERED, "")}` : `- ${raw.replace(BULLET_GLYPH, "")}`);
        i++;
      }
      blocks.push(items.join("\n"));
      continue;
    }

    const afterColon = blocks.length > 0 && /:$/.test(blocks[blocks.length - 1]);
    let run = 0;
    while (i + run < lines.length && listish(lines[i + run])) run++;
    if (run >= 3 || (run >= 2 && afterColon)) {
      const items = lines.slice(i, i + run).map((l) => `- ${l.trim()}`);
      blocks.push(items.join("\n"));
      i += run;
      continue;
    }

    if (isHeading(t, lines[i + 1])) {
      blocks.push(`### ${t}`);
      i++;
      continue;
    }

    blocks.push(t);
    i++;
  }

  if (blocks.length) {
    const first = blocks[0].replace(/^#+\s*/, "").trim().toLowerCase();
    const heading = title.trim().toLowerCase();
    if (heading && first === heading) {
      blocks.shift();
      changes.push("removed the repeated title");
    } else if (blocks.length > 1 && !/^#/.test(blocks[0]) && blocks[0].length <= 90 && !ENDS_SENTENCE.test(blocks[0])) {
      blocks[0] = `## ${blocks[0]}`;
    }
  }

  const markdown = tidyBlankLines(blocks.join("\n\n"));
  const count = (re: RegExp) => (markdown.match(re) ?? []).length;
  const headings = count(/^#{2,6} /gm);
  const bullets = count(/^(?:- |\d+\. )/gm);
  const paragraphs = markdown.split("\n\n").filter((b) => b.trim() && !/^(#{2,6} |- |\d+\. )/.test(b.trim())).length;
  if (headings) changes.push(`${headings} heading${headings === 1 ? "" : "s"}`);
  if (bullets) changes.push(`${bullets} list item${bullets === 1 ? "" : "s"}`);
  if (paragraphs) changes.push(`${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}`);

  return { markdown, changes, warnings };
}

export function insertFormatted(body: string, start: number, end: number, markdown: string): { text: string; caret: number } {
  const before = body.slice(0, start);
  const after = body.slice(end);
  const isBlock = /\n/.test(markdown) || /^(#{1,6} |[-*+] |\d+[.)] |> |```|\|)/.test(markdown);
  const lead = isBlock && before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const tail = isBlock && after && !after.startsWith("\n") ? "\n\n" : "";
  return { text: before + lead + markdown + tail + after, caret: (before + lead + markdown).length };
}

export function worthFormatting(html: string, text: string): boolean {
  if (!text.trim() && !html.trim()) return false;
  if (html.trim()) return true;
  return text.trim().split("\n").filter((l) => l.trim()).length >= 3;
}

export function formatPasted({ html, text, title }: { html?: string; text: string; title?: string }): FormatResult {
  if (html && html.trim()) {
    const fromHtml = htmlToMarkdown(html);
    if (fromHtml.markdown.trim() && fromHtml.changes.length) return fromHtml;
    if (fromHtml.markdown.trim()) return tidyPlainText(fromHtml.markdown, title);
  }
  return tidyPlainText(text, title);
}
