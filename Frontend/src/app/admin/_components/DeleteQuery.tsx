"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* Deletes one enquiry, from wherever its card is shown.
 *
 * The confirmation is part of the page rather than a window.confirm: a browser
 * told to block this page's dialogs returns false from confirm() without
 * showing anything, and the button would look broken.
 *
 * On success the page is refreshed rather than the card just being hidden, so
 * the dashboard's counts above it agree with the list below. */
export function DeleteQuery({ id, company }: { id: number | string; company: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/queries/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't delete it.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete it.");
      setBusy(false);
      setConfirming(false);
    }
  }

  if (error) {
    return (
      <span className="flex items-center gap-2">
        <span role="alert" className="text-xs text-accent">
          {error}
        </span>
        <button type="button" onClick={() => setError(null)} className="text-xs font-medium text-muted hover:text-foreground">
          Dismiss
        </button>
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-tint"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted">Delete this enquiry from {company}? It can&rsquo;t be undone.</span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Keep
      </button>
    </span>
  );
}
