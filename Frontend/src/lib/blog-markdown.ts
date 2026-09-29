import { marked } from "marked";

/* Markdown into the HTML the editor edits.
 *
 * Posts are stored as Markdown — that hasn't changed, and it's what keeps the
 * CMS, the site and this editor in agreement. The visual editor works in HTML,
 * so a post is converted on the way in and back again on the way out.
 *
 * The one thing Markdown can't express is an uploaded image: a post writes
 * those as `![media:7]()`, an id rather than a URL, because the file lives in
 * the CMS and its address can change. They're swapped for real <img> tags to
 * be seen, and swapped back on save. */

const MEDIA_TOKEN = /!\[media:(\d+)\]\(\s*\)/g;

/** Stands in for an uploaded image whose thumbnail hasn't loaded yet, so the
 *  picture is still a real element the writer can see and move. */
const PENDING_IMAGE = "/blog-image-loading.svg";

marked.setOptions({ gfm: true, breaks: false });

/** Markdown → HTML for the editor. `urlFor` resolves an uploaded image's id. */
export function markdownToEditorHtml(markdown: string, urlFor: (id: number) => string | undefined): string {
  if (!markdown.trim()) return "";

  /* Swapped before Markdown is parsed: an empty URL would otherwise become an
   * <img src=""> the editor can't show and the writer can't select.
   *
   * The id is written even when the thumbnail hasn't arrived yet. Leaving the
   * token as text looked harmless but wasn't: it parsed to a plain <img> with
   * no id, and the next save dropped the picture out of the article. */
  const withImages = markdown.replace(MEDIA_TOKEN, (_whole, id: string) => {
    const url = urlFor(Number(id));
    return `<img src="${url ?? PENDING_IMAGE}" data-media-id="${id}" alt="">`;
  });

  return marked.parse(withImages, { async: false });
}

/** Whether pasted plain text is Markdown rather than prose — ChatGPT's copy
 *  button hands over `## headings` and `**bold**` as text, and pasting that as
 *  literal characters is not what anyone means by it. */
export function looksLikeMarkdown(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return false;
  const marked = lines.filter((l) => /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.*\|)/.test(l)).length;
  const inline = /\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`/.test(text);
  return marked / lines.length >= 0.2 || (inline && marked > 0);
}

/** Markdown (as pasted) → HTML, for dropping into the editor at the cursor. */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
