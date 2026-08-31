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
      className={`prose max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-a:text-accent prose-strong:text-foreground prose-p:text-muted prose-li:text-muted ${className}`}
    >
      <PayloadRichText data={data} />
    </div>
  );
}
