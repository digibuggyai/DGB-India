import { marked } from "marked";

const MEDIA_TOKEN = /!\[media:(\d+)\]\(\s*\)/g;

const PENDING_IMAGE = "/blog-image-loading.svg";

marked.setOptions({ gfm: true, breaks: false });

export function markdownToEditorHtml(markdown: string, urlFor: (id: number) => string | undefined): string {
  if (!markdown.trim()) return "";

  const withImages = markdown.replace(MEDIA_TOKEN, (_whole, id: string) => {
    const url = urlFor(Number(id));
    return `<img src="${url ?? PENDING_IMAGE}" data-media-id="${id}" alt="">`;
  });

  return marked.parse(withImages, { async: false });
}

export function looksLikeMarkdown(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return false;
  const marked = lines.filter((l) => /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|```|\|.*\|)/.test(l)).length;
  const inline = /\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`/.test(text);
  return marked / lines.length >= 0.2 || (inline && marked > 0);
}

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
