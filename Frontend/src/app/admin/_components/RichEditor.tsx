"use client";

import { Image as ImageExtension } from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useRef, type ReactNode } from "react";
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
 * button puts Markdown on it as plain text, which is converted before it lands.
 *
 * Underline is deliberately missing from the toolbar: Markdown has no way to
 * write one, so it would vanish the moment the post was saved. A button that
 * silently does nothing is worse than no button. */

type Props = {
  /** The post, as Markdown. */
  value: string;
  onChange: (markdown: string) => void;
  /** Resolves an uploaded image's id to a URL it can be shown at. */
  imageUrl: (id: number) => string | undefined;
  /** Rendered into the toolbar — the Insert image control lives here. */
  children?: ReactNode;
};

const btn =
  "inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-medium text-foreground transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40";
const active = "bg-tint text-tint-foreground";

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
      className={`${btn} ${isActive ? active : ""}`}
    >
      {label}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-border" />;

export function RichEditor({ value, onChange, imageUrl, children }: Props) {
  /* The Markdown this editor last produced. Without it, every keystroke would
   * round-trip back through the parser and reset the caret to the top. */
  const emitted = useRef<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noreferrer noopener" } },
      }),
      // Pasted tables are kept — a comparison table is often the point of the post.
      TableKit.configure({ table: { resizable: false } }),
      ImageExtension.configure({ allowBase64: false, HTMLAttributes: { class: "rounded-md" } }),
    ],
    content: markdownToEditorHtml(value, imageUrl),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[28rem] px-4 py-3 focus:outline-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-accent prose-table:text-xs prose-th:text-foreground",
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";
        // HTML on the clipboard already carries the structure; TipTap reads it.
        if (html.trim() || !looksLikeMarkdown(text)) return false;
        event.preventDefault();
        editorRef.current?.chain().focus().insertContent(markdownToHtml(text)).run();
        return true;
      },
    },
    onUpdate({ editor }) {
      const markdown = editorHtmlToMarkdown(editor.getHTML());
      emitted.current = markdown;
      onChange(markdown);
    },
  });

  const editorRef = useRef<Editor | null>(null);
  editorRef.current = editor;

  /* Content set from outside — opening a post, or undoing a paste — is loaded
   * in. Anything this editor itself produced is ignored, or typing would fight
   * with the parser. */
  useEffect(() => {
    if (!editor || value === emitted.current) return;
    editor.commands.setContent(markdownToEditorHtml(value, imageUrl), { emitUpdate: false });
    emitted.current = value;
    // imageUrl changes as thumbnails arrive; re-running on it would reset the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[28rem] rounded-md border border-border bg-background px-4 py-3 text-sm text-muted">Loading the editor…</div>;
  }

  const heading = (level: 2 | 3 | 4, label: string, title: string) => (
    <Button
      editor={editor}
      title={title}
      label={label}
      isActive={editor.isActive("heading", { level })}
      onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
    />
  );

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background focus-within:border-accent">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5">
        <Button
          editor={editor}
          title="Paragraph"
          label="¶"
          isActive={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        {heading(2, "H2", "Heading")}
        {heading(3, "H3", "Subheading")}
        {heading(4, "H4", "Small heading")}
        <Divider />
        <Button editor={editor} title="Bold (Ctrl+B)" label={<b>B</b>} isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Button editor={editor} title="Italic (Ctrl+I)" label={<i>I</i>} isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Button
          editor={editor}
          title="Strikethrough"
          label={<s>S</s>}
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <Button
          editor={editor}
          title="Code"
          label={<span className="font-mono text-xs">{"</>"}</span>}
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
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
        <Divider />
        <Button
          editor={editor}
          title="Bulleted list"
          label="•—"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Button
          editor={editor}
          title="Numbered list"
          label="1."
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Button
          editor={editor}
          title="Quote"
          label="❝"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Button editor={editor} title="Divider" label="—" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Divider />
        <Button
          editor={editor}
          title="Clear formatting"
          label="Tx"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />
        <Button
          editor={editor}
          title="Undo (Ctrl+Z)"
          label="↶"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <Button
          editor={editor}
          title="Redo (Ctrl+Y)"
          label="↷"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
        {children ? (
          <>
            <Divider />
            {children}
          </>
        ) : null}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
