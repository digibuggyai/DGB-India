import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

export function RichText({
  data,
  className = "",
}: {
  data: SerializedEditorState | null | undefined;
  className?: string;
}) {
  if (!data) return null;
  return (
    <div
      /* Tables are laid out as blocks so a wide comparison table scrolls on its
       * own on a phone, instead of stretching the article or being cut off.
       * The rows still line up: the cells form an anonymous table box inside. */
      className={`prose max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-a:text-accent prose-strong:text-foreground prose-p:text-muted prose-li:text-muted prose-table:block prose-table:w-full prose-table:overflow-x-auto prose-table:text-sm prose-thead:border-border-strong prose-th:text-foreground prose-th:font-semibold prose-td:text-muted prose-td:align-top prose-tr:border-border ${className}`}
    >
      <PayloadRichText data={data} />
    </div>
  );
}
