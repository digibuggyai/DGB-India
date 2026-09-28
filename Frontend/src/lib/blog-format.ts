/* Turning pasted content into Markdown.
 *
 * Someone writing a post drafts it in Word, Google Docs, Notion or another
 * site, then pastes it in. The clipboard carries that text twice: once as HTML,
 * with its headings, bullets, bold and links intact, and once as plain text,
 * which is a flat wall of lines. A textarea takes the plain flavour, so all the
 * structure is thrown away before the author ever sees it — and they end up
 * marking up every heading and bullet again by hand.
 *
 * So: read the HTML when it's there, and fall back to reading the shape of the
 * plain text when it isn't. Neither is ever a perfect guess, which is why every
 * caller of this file offers an undo.
 */

export type FormatResult = {
  markdown: string;
  /** What changed, in the words the notice shows the author. */
  changes: string[];
  /** Things the author has to deal with themselves. */
  warnings: string[];
};

/* ---------------- shared tidying ---------------- */

const clean = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    // Word and Docs pad with non-breaking and zero-width characters.
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[ \t]+$/gm, "");

/** Never more than one blank line between blocks, and none at either end. */
const tidyBlankLines = (s: string) => s.replace(/\n{3,}/g, "\n\n").trim();

/** Markdown's own characters, escaped so pasted prose doesn't turn into markup. */
const escapeInline = (s: string) => s.replace(/([*_`[\]])/g, "\\$1");

/* ---------------- HTML → Markdown ---------------- */

const BLOCK = new Set([
  "P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE",
  "PRE", "HR", "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "SECTION", "ARTICLE", "BR",
]);

const isBold = (el: Element) => {
  const weight = (el as HTMLElement).style?.fontWeight;
  // Google Docs wraps a whole copied document in <b style="font-weight:normal">.
  // Taking that at face value makes the entire article bold — and, worse,
  // inline, which flattens every heading and list inside it.
  if (weight === "normal" || weight === "400") return false;
  if (/^(B|STRONG)$/.test(el.tagName)) return true;
  // Docs marks real bold with a weight rather than a <strong>.
  return weight === "bold" || (/^\d+$/.test(weight ?? "") && Number(weight) >= 600);
};

/** Does this element contain block-level content? An inline tag that wraps
 *  blocks — Docs' <b> wrapper, a <span> around paragraphs — has to be walked
 *  as a container, or everything inside it collapses onto one line. */
const wrapsBlocks = (el: Element): boolean =>
  [...el.children].some((c) => BLOCK.has(c.tagName) || wrapsBlocks(c));

const isItalic = (el: Element) => /^(I|EM)$/.test(el.tagName) || (el as HTMLElement).style?.fontStyle === "italic";

type Ctx = { images: number; tables: number };

/** Inline content: bold, italic, code, links. Block children are handled above. */
function inline(node: Node, ctx: Ctx): string {
  if (node.nodeType === Node.TEXT_NODE) return escapeInline((node.textContent ?? "").replace(/\s+/g, " "));
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  if (/^(SCRIPT|STYLE|HEAD|META|LINK|NOSCRIPT)$/.test(el.tagName)) return "";
  if (el.tagName === "BR") return "\n";

  if (el.tagName === "IMG") {
    // Images have to be uploaded through the editor to be stored with the post;
    // a pasted <img> points at someone else's server. Counted, not kept.
    ctx.images++;
    return "";
  }

  const inner = [...el.childNodes].map((c) => inline(c, ctx)).join("");
  if (!inner.trim()) return inner.trim() ? inner : "";

  if (el.tagName === "CODE" || el.tagName === "TT") return `\`${inner.replace(/\\([*_`[\]])/g, "$1")}\``;
  if (el.tagName === "A") {
    const href = (el as HTMLAnchorElement).getAttribute("href") ?? "";
    // Only real links survive; Docs wraps everything in anchors to itself.
    if (!/^(https?:|mailto:|\/)/i.test(href)) return inner;
    return `[${inner}](${href})`;
  }
  if (isBold(el) && isItalic(el)) return `***${inner}***`;
  if (isBold(el)) return `**${inner}**`;
  if (isItalic(el)) return `*${inner}*`;
  return inner;
}

/** A heading, list, quote or paragraph, as one Markdown block. */
function block(el: Element, ctx: Ctx, depth = 0): string {
  const tag = el.tagName;

  if (/^H[1-6]$/.test(tag)) {
    const text = inline(el, ctx).trim();
    if (!text) return "";
    // The page already prints the post's Title as its h1, so a pasted h1 is
    // demoted rather than competing with it.
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

/** Walks a container, emitting one block per block-level child. */
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

export function htmlToMarkdown(html: string): FormatResult {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, head, meta, link").forEach((n) => n.remove());

  const ctx: Ctx = { images: 0, tables: 0 };
  const markdown = tidyBlankLines(clean(children(doc.body, ctx)))
    // Word writes its list numbers as text followed by spacing spans, which
    // leaves "1.One copy" once the spans are stripped.
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

/* ---------------- plain text → Markdown ---------------- */

const BULLET_GLYPH = /^[\s]*[•●▪‣·◦*–—-]\s+/;
const NUMBERED = /^[\s]*(\d{1,2})[.)]\s+/;
const ENDS_SENTENCE = /[.!?:;,]$/;

/** Text that already carries Markdown is only re-spaced, never restructured. */
function looksLikeMarkdown(lines: string[]): boolean {
  const meaningful = lines.filter((l) => l.trim());
  if (!meaningful.length) return false;
  const marked = meaningful.filter((l) => /^(#{1,6} |[-*+] |\d+[.)] |> |```|\|)/.test(l.trim())).length;
  return marked / meaningful.length >= 0.25;
}

/** Is this line a heading rather than a sentence? Short, self-contained, and
 *  introducing what follows — a question or a bare phrase, never a sentence
 *  with a full stop, and never a run of fragments like "2TB? 4TB? 8TB?". */
function isHeading(line: string, next: string | undefined): boolean {
  const t = line.trim();
  if (!t || t.length > 70) return false;
  const words = t.split(/\s+/).length;
  if (words < 2 || words > 12) return false;
  if ((t.match(/[?!.]/g) ?? []).length > 1) return false;
  if (/[.,;:]$/.test(t)) return false;
  // Something has to follow it, or it's the last line of a paragraph.
  if (!next || !next.trim()) return false;
  return t.endsWith("?") || !ENDS_SENTENCE.test(t);
}

/**
 * Reads the shape of flat pasted text: runs of short lines become lists,
 * standalone questions become headings, everything else becomes a paragraph of
 * its own so the post isn't one unbroken wall.
 */
export function tidyPlainText(text: string, title = ""): FormatResult {
  const lines = clean(text).split("\n");
  const changes: string[] = [];
  const warnings: string[] = [];

  if (looksLikeMarkdown(lines)) {
    return { markdown: tidyBlankLines(lines.join("\n")), changes: ["spacing"], warnings };
  }

  const blocks: string[] = [];
  let i = 0;

  // A line the author wrote as a bullet already, or one that reads like a list
  // item: short, and not a sentence.
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

    // Bullets and numbers the author typed themselves.
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

    // An unmarked list: several short fragments in a row, or a couple of them
    // straight after a line that ends in a colon.
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

  // The first line is usually the article's own title, which the post already
  // has in its own field — drop it rather than print it twice. Otherwise it
  // opens the piece, so it reads as a heading — but only when something
  // follows it: a one-line paste is a line, not a title.
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

  // Counted from the finished text rather than tallied along the way, so what
  // the author is told matches what they can see.
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

/**
 * Puts formatted content into the box at the cursor, and says where the cursor
 * should end up.
 *
 * Blocks need a blank line around them or Markdown runs them together — but a
 * single sentence dropped into the middle of a paragraph is not a block, and
 * splitting the line around it would be wrong.
 */
export function insertFormatted(body: string, start: number, end: number, markdown: string): { text: string; caret: number } {
  const before = body.slice(0, start);
  const after = body.slice(end);
  const isBlock = /\n/.test(markdown) || /^(#{1,6} |[-*+] |\d+[.)] |> |```|\|)/.test(markdown);
  const lead = isBlock && before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
  const tail = isBlock && after && !after.startsWith("\n") ? "\n\n" : "";
  return { text: before + lead + markdown + tail + after, caret: (before + lead + markdown).length };
}

/** Whether a paste is worth reformatting at all. A word, a URL or a single
 *  line goes in as the browser would put it — restructuring something dropped
 *  into the middle of a sentence would be obnoxious. */
export function worthFormatting(html: string, text: string): boolean {
  if (!text.trim() && !html.trim()) return false;
  if (html.trim()) return true;
  return text.trim().split("\n").filter((l) => l.trim()).length >= 3;
}

/** What the editor calls on paste: HTML when the clipboard has it, the text's
 *  own shape when it doesn't. */
export function formatPasted({ html, text, title }: { html?: string; text: string; title?: string }): FormatResult {
  if (html && html.trim()) {
    const fromHtml = htmlToMarkdown(html);
    // A clipboard can carry HTML that holds nothing but a bare line of text —
    // no better than the plain flavour, so fall through to reading its shape.
    if (fromHtml.markdown.trim() && fromHtml.changes.length) return fromHtml;
    if (fromHtml.markdown.trim()) return tidyPlainText(fromHtml.markdown, title);
  }
  return tidyPlainText(text, title);
}
