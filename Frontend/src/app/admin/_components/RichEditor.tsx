"use client";

import { Image as ImageExtension } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { editorHtmlToMarkdown } from "@/lib/blog-format";
import { markdownToEditorHtml, markdownToHtml, looksLikeMarkdown } from "@/lib/blog-markdown";

/* The article editor.
 *
 * What the writer sees is what the post will look like: headings are headings,
 * bold is bold, a list is a list. Underneath, a post is still stored as
 * Markdown — the same Markdown the CMS and the site already agree on — so this
 * is a change of surface, not of storage. Nothing needs migrating and the CMS's
 * own editor still opens every post.
 *
 * Paste is the reason it exists. Word, Google Docs and web pages put HTML on
 * the clipboard, which arrives here with its structure intact; ChatGPT's copy
 * button puts Markdown on it as plain text, which is converted before it lands;
 * a screenshot arrives as a file and is uploaded.
 *
 * Underline, highlight, subscript, superscript and heading anchors are all
 * deliberately absent: Markdown cannot write any of them, so they would vanish
 * the moment a post was saved. A button that silently does nothing is worse
 * than no button. */

type Props = {
  /** The post, as Markdown. */
  value: string;
  onChange: (markdown: string) => void;
  /** Resolves an uploaded image's id to a URL it can be shown at. */
  imageUrl: (id: number) => string | undefined;
  /** Rendered into the toolbar — the Image control lives here. */
  children?: ReactNode;
  /** Uploads a file and returns the stored image, so a pasted screenshot or a
   *  dropped file becomes part of the post rather than a link to someone
   *  else's server. Without it, paste and drop fall back to doing nothing. */
  onUploadImage?: (file: File) => Promise<{ id: number; url: string; alt?: string }>;
  onUploadError?: (message: string) => void;
};

const btn =
  "inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium text-foreground transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40";
const activeClass = "bg-tint text-tint-foreground";

function Button({
  editor,
  onClick,
  isActive,
  label,
  title,
  disabled,
}: {
  editor: Editor;
  onClick: () => void;
  isActive?: boolean;
  label: ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={Boolean(isActive)}
      disabled={disabled}
      // The editor keeps focus, so the caret doesn't jump when a button is hit.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        onClick();
        editor.commands.focus();
      }}
      className={`${btn} ${isActive ? activeClass : ""}`}
    >
      {label}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-border" />;

const SPECIALS = [
  "₹", "€", "£", "©", "™", "®", "°", "×", "÷", "–", "—", "…", "→", "←", "↑", "↓",
  "✓", "✕", "½", "¼", "¾", "±", "≈", "≤", "≥", "•", "§", "“", "”", "‘", "’", "″",
];

const SHORTCUTS: [string, string][] = [
  ["Ctrl + B", "Bold"],
  ["Ctrl + I", "Italic"],
  ["Ctrl + K", "Link"],
  ["Ctrl + Z / Y", "Undo and redo"],
  ["Tab / Shift + Tab", "Indent or outdent a list item"],
  ["Ctrl + V", "Paste, keeping the formatting"],
  ["Esc", "Leave full screen"],
];

export function RichEditor({ value, onChange, imageUrl, children, onUploadImage, onUploadError }: Props) {
  /* The Markdown this editor last produced. Without it, every keystroke would
   * round-trip back through the parser and reset the caret to the top. */
  const emitted = useRef<string | null>(null);
  const editorRef = useRef<Editor | null>(null);

  /* Full screen is a state flag rather than the Fullscreen API, so the editor
   * keeps its React tree and the caret and undo history survive. */
  const [full, setFull] = useState(false);
  /** The raw Markdown view, when it is open. */
  const [source, setSource] = useState<string | null>(null);
  const [spellcheck, setSpellcheck] = useState(true);
  const [menu, setMenu] = useState<"chars" | "help" | null>(null);

  /* Uploads each image and puts it where the cursor (or the drop) was. The post
   * stores the media id, never a URL, so the picture survives the CMS moving
   * its files. */
  async function insertFiles(files: File[], at?: number) {
    if (!onUploadImage) {
      onUploadError?.("Use the Image button to add a picture.");
      return;
    }
    for (const file of files) {
      try {
        const image = await onUploadImage(file);
        const chain = editorRef.current?.chain().focus();
        if (!chain) return;
        const node = { type: "image", attrs: { src: image.url, alt: image.alt ?? "", "data-media-id": String(image.id) } };
        (at == null ? chain.insertContent(node) : chain.insertContentAt(at, node)).run();
      } catch (err) {
        onUploadError?.(err instanceof Error ? err.message : "Couldn't upload that image.");
      }
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noreferrer noopener" } },
      }),
      // Pasted tables are kept — a comparison table is often the point of the post.
      TableKit.configure({ table: { resizable: false } }),
      /* The media id has to survive as an attribute: it is what the post stores,
       * and what tells our own images apart from a pasted hotlink. */
      ImageExtension.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            "data-media-id": {
              default: null,
              parseHTML: (el: HTMLElement) => el.getAttribute("data-media-id"),
              renderHTML: (attrs: Record<string, unknown>) =>
                attrs["data-media-id"] ? { "data-media-id": String(attrs["data-media-id"]) } : {},
            },
          };
        },
      }).configure({ allowBase64: false, HTMLAttributes: { class: "rounded-md" } }),
    ],
    content: markdownToEditorHtml(value, imageUrl),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[28rem] px-4 py-3 focus:outline-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-accent prose-table:text-xs prose-th:text-foreground",
      },
      handlePaste(view, event) {
        // A screenshot on the clipboard arrives as a file, not as text.
        const files = [...(event.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (files.length) {
          event.preventDefault();
          void insertFiles(files);
          return true;
        }
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";
        // HTML on the clipboard already carries the structure; TipTap reads it.
        if (html.trim() || !looksLikeMarkdown(text)) return false;
        event.preventDefault();
        editorRef.current?.chain().focus().insertContent(markdownToHtml(text)).run();
        return true;
      },
      handleDrop(view, event) {
        const files = [...((event as DragEvent).dataTransfer?.files ?? [])].filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        // Dropped where the pointer is, not at the end of the article.
        const at = view.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY })?.pos;
        void insertFiles(files, at);
        return true;
      },
    },
    onUpdate({ editor }) {
      const markdown = editorHtmlToMarkdown(editor.getHTML());
      emitted.current = markdown;
      onChange(markdown);
    },
  });

  editorRef.current = editor;

  /* Content set from outside — opening a post, or undoing — is loaded in.
   * Anything this editor produced is ignored, or typing fights the parser. */
  useEffect(() => {
    if (!editor || value === emitted.current) return;
    editor.commands.setContent(markdownToEditorHtml(value, imageUrl), { emitUpdate: false });
    emitted.current = value;
    // imageUrl changes as thumbnails arrive; re-running on it would reset the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full]);

  /* Clipboard buttons need the browser's permission, which Firefox never grants
   * for rich content. Ctrl+V always works, so a refusal says so rather than
   * failing silently. */
  async function readClipboard(plain: boolean) {
    const active = editorRef.current;
    if (!active) return;
    try {
      if (plain) {
        const text = await navigator.clipboard.readText();
        if (text.trim()) active.chain().focus().insertContent(text).run();
        return;
      }
      for (const item of await navigator.clipboard.read()) {
        const image = item.types.find((t) => t.startsWith("image/"));
        if (image) {
          await insertFiles([new File([await item.getType(image)], "pasted.png", { type: image })]);
          continue;
        }
        if (item.types.includes("text/html")) {
          active.chain().focus().insertContent(await (await item.getType("text/html")).text()).run();
          continue;
        }
        if (item.types.includes("text/plain")) {
          const text = await (await item.getType("text/plain")).text();
          active.chain().focus().insertContent(looksLikeMarkdown(text) ? markdownToHtml(text) : text).run();
        }
      }
    } catch {
      onUploadError?.("Your browser won't let a button read the clipboard — press Ctrl+V instead.");
    }
  }

  if (!editor) {
    return <div className="min-h-[28rem] rounded-md border border-border bg-background px-4 py-3 text-sm text-muted">Loading the editor…</div>;
  }

  /** The block type under the cursor, for the Format menu. */
  const currentBlock = editor.isActive("codeBlock")
    ? "pre"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : editor.isActive("heading", { level: 4 })
          ? "h4"
          : "p";

  function setBlock(kind: string) {
    const chain = editor!.chain().focus();
    if (kind === "p") chain.setParagraph().run();
    else if (kind === "pre") chain.toggleCodeBlock().run();
    else chain.toggleHeading({ level: Number(kind[1]) as 2 | 3 | 4 }).run();
  }

  return (
    <div
      className={
        full
          ? "fixed inset-0 z-50 flex flex-col overflow-hidden border border-border bg-background"
          : "overflow-hidden rounded-md border border-border bg-background focus-within:border-accent"
      }
    >
      {/* Row one: clipboard, history, links, what you can insert, how you view it. */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5">
        <Button editor={editor} title="Cut" label="✂" onClick={() => document.execCommand("cut")} />
        <Button editor={editor} title="Copy" label="⧉" onClick={() => document.execCommand("copy")} />
        <Button editor={editor} title="Paste" label="📋" onClick={() => void readClipboard(false)} />
        <Button editor={editor} title="Paste as plain text" label="📋ᵀ" onClick={() => void readClipboard(true)} />
        <Button editor={editor} title="Paste from Word or Google Docs" label="📋ᵂ" onClick={() => void readClipboard(false)} />
        <Divider />
        <Button editor={editor} title="Undo (Ctrl+Z)" label="↶" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <Button editor={editor} title="Redo (Ctrl+Y)" label="↷" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
        <Divider />
        <Button
          editor={editor}
          title={spellcheck ? "Spell check is on" : "Spell check is off"}
          label={<span className="text-xs font-semibold">ABC</span>}
          isActive={spellcheck}
          onClick={() => {
            const next = !spellcheck;
            setSpellcheck(next);
            // ProseMirror owns the element, so the attribute is set on it directly.
            document.querySelector<HTMLElement>(".ProseMirror")?.setAttribute("spellcheck", String(next));
          }}
        />
        <Divider />
        <Button
          editor={editor}
          title="Link (Ctrl+K)"
          label="🔗"
          isActive={editor.isActive("link")}
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const href = window.prompt("Link address", previous ?? "https://");
            if (href === null) return;
            if (!href.trim()) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
          }}
        />
        <Button editor={editor} title="Remove link" label="⛓" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()} />
        <Divider />
        {children}
        <Button
          editor={editor}
          title="Insert table"
          label="⊞"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <Button editor={editor} title="Horizontal line" label="—" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <span className="relative inline-flex">
          <Button
            editor={editor}
            title="Special character"
            label="Ω"
            isActive={menu === "chars"}
            onClick={() => setMenu(menu === "chars" ? null : "chars")}
          />
          {menu === "chars" ? (
            <span className="absolute left-0 top-9 z-20 grid w-64 grid-cols-8 gap-0.5 rounded-md border border-border bg-background p-2 shadow-[0_16px_32px_-16px_rgba(16,21,28,0.45)]">
              {SPECIALS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-7 rounded text-sm hover:bg-tint"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    editor.chain().focus().insertContent(c).run();
                    setMenu(null);
                  }}
                >
                  {c}
                </button>
              ))}
            </span>
          ) : null}
        </span>
        <Divider />
        <Button
          editor={editor}
          title={full ? "Leave full screen (Esc)" : "Full screen"}
          label={full ? "⤡" : "⤢"}
          isActive={full}
          onClick={() => setFull((f) => !f)}
        />
        <Button
          editor={editor}
          title="Source — the Markdown this post is stored as"
          label={<span className="text-xs font-semibold">Source</span>}
          isActive={source !== null}
          onClick={() => {
            if (source === null) {
              setSource(editorHtmlToMarkdown(editor.getHTML()));
              return;
            }
            // Coming back: what was typed in the box becomes the post.
            onChange(source);
            editor.commands.setContent(markdownToEditorHtml(source, imageUrl), { emitUpdate: false });
            emitted.current = source;
            setSource(null);
          }}
        />
      </div>

      {/* Row two: text formatting, lists, block type. */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5">
        <Button editor={editor} title="Bold (Ctrl+B)" label={<b>B</b>} isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Button editor={editor} title="Italic (Ctrl+I)" label={<i>I</i>} isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Button editor={editor} title="Strikethrough" label={<s>S</s>} isActive={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <Button
          editor={editor}
          title="Remove formatting"
          label={
            <span>
              I<sub>x</sub>
            </span>
          }
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        />
        <Divider />
        <Button
          editor={editor}
          title="Numbered list"
          label="1."
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Button
          editor={editor}
          title="Bulleted list"
          label="•—"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Button
          editor={editor}
          title="Outdent (Shift+Tab)"
          label="⇤"
          disabled={!editor.can().liftListItem("listItem")}
          onClick={() => editor.chain().focus().liftListItem("listItem").run()}
        />
        <Button
          editor={editor}
          title="Indent (Tab)"
          label="⇥"
          disabled={!editor.can().sinkListItem("listItem")}
          onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
        />
        <Divider />
        <Button editor={editor} title="Quote" label="❝" isActive={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Divider />

        <select
          aria-label="Styles"
          value={editor.isActive("code") ? "code" : ""}
          onChange={(e) => {
            if (e.target.value === "code") editor.chain().focus().toggleCode().run();
            if (e.target.value === "clear") editor.chain().focus().unsetAllMarks().clearNodes().run();
          }}
          className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">Styles</option>
          <option value="code">Inline code</option>
          <option value="clear">Clear everything</option>
        </select>

        <select
          aria-label="Format"
          value={currentBlock}
          onChange={(e) => setBlock(e.target.value)}
          className="h-8 rounded border border-border bg-background px-2 text-xs text-foreground focus:border-accent focus:outline-none"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="h4">Small heading</option>
          <option value="pre">Preformatted</option>
        </select>

        <span className="relative ml-auto inline-flex">
          <Button editor={editor} title="Keyboard shortcuts" label="?" isActive={menu === "help"} onClick={() => setMenu(menu === "help" ? null : "help")} />
          {menu === "help" ? (
            <span className="absolute right-0 top-9 z-20 block w-72 rounded-md border border-border bg-background p-3 text-xs shadow-[0_16px_32px_-16px_rgba(16,21,28,0.45)]">
              {SHORTCUTS.map(([keys, what]) => (
                <span key={keys} className="mb-1.5 flex justify-between gap-3">
                  <span className="font-mono text-foreground">{keys}</span>
                  <span className="text-right text-muted">{what}</span>
                </span>
              ))}
              <span className="mt-2 block border-t border-border pt-2 leading-relaxed text-muted">
                Paste keeps the formatting from Word, Google Docs and web pages. Screenshots and dropped image files are uploaded.
              </span>
            </span>
          ) : null}
        </span>
      </div>

      {/* Table controls, only while the cursor is inside a table. */}
      {editor.isActive("table") ? (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-tint/40 px-2 py-1.5">
          <span className="px-1 text-xs font-medium text-muted">Table</span>
          <Button editor={editor} title="Row above" label="↑+" onClick={() => editor.chain().focus().addRowBefore().run()} />
          <Button editor={editor} title="Row below" label="↓+" onClick={() => editor.chain().focus().addRowAfter().run()} />
          <Button editor={editor} title="Delete row" label="↕−" onClick={() => editor.chain().focus().deleteRow().run()} />
          <Divider />
          <Button editor={editor} title="Column left" label="←+" onClick={() => editor.chain().focus().addColumnBefore().run()} />
          <Button editor={editor} title="Column right" label="→+" onClick={() => editor.chain().focus().addColumnAfter().run()} />
          <Button editor={editor} title="Delete column" label="↔−" onClick={() => editor.chain().focus().deleteColumn().run()} />
          <Divider />
          <Button editor={editor} title="Header row on or off" label="H" onClick={() => editor.chain().focus().toggleHeaderRow().run()} />
          <Button editor={editor} title="Merge or split cells" label="⊟" onClick={() => editor.chain().focus().mergeOrSplit().run()} />
          <Button editor={editor} title="Delete table" label="✕" onClick={() => editor.chain().focus().deleteTable().run()} />
        </div>
      ) : null}

      {source !== null ? (
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          className={`w-full border-0 bg-background px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground focus:outline-none ${full ? "min-h-0 flex-1" : "min-h-[28rem]"}`}
        />
      ) : (
        <EditorContent editor={editor} className={full ? "min-h-0 flex-1 overflow-y-auto" : undefined} />
      )}
    </div>
  );
}
