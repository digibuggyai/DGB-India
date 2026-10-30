"use client";

import { useMemo, useState } from "react";
import {
  MAX_FAQS,
  META_DESCRIPTION_IDEAL,
  META_TITLE_IDEAL,
  SCHEMA_TEMPLATES,
  checkJsonLd,
  type Faq,
} from "@/lib/blog-schema";

/* The search-engine half of the post editor: what Google shows, the questions
 * block, and any extra structured data.
 *
 * None of it is required. A post saved without touching any of this looks
 * exactly as it does today — the page falls back to the title and the excerpt,
 * and still gets its BlogPosting and breadcrumb markup. */

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground/80";
const sectionClass = "rounded-lg border border-border bg-background p-5";

/** A length counter that warns rather than blocks: these are Google's
 *  truncation points, not rules, and a longer one is sometimes the right call. */
function Counter({ value, ideal }: { value: string; ideal: number }) {
  const n = value.trim().length;
  const over = n > ideal;
  return (
    <span className={`text-xs tabular-nums ${over ? "text-accent" : "text-muted"}`}>
      {n}/{ideal}
      {over ? " — Google will cut this short" : ""}
    </span>
  );
}

/* Roughly what the result looks like. Not pixel-exact — Google rewrites titles
 * and descriptions whenever it likes — but close enough to catch a title that
 * reads badly or a description that stops mid-sentence. */
function GooglePreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  const shown = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text);
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <span className="mb-2 block text-xs font-medium text-muted">Roughly how this looks in Google</span>
      <div className="truncate text-xs text-muted">www.dgbindia.com › resources › blog › {slug || "…"}</div>
      <div className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab]">
        {shown(title.trim(), META_TITLE_IDEAL) || "Your title appears here"}
      </div>
      <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-foreground/70">
        {shown(description.trim(), META_DESCRIPTION_IDEAL) || "Your description appears here."}
      </p>
    </div>
  );
}

export function PostSeoFields({
  metaTitle,
  onMetaTitle,
  metaDescription,
  onMetaDescription,
  keywords,
  onKeywords,
  faqs,
  onFaqs,
  schemaJson,
  onSchemaJson,
  fallbackTitle,
  fallbackDescription,
  slug,
}: {
  metaTitle: string;
  onMetaTitle: (v: string) => void;
  metaDescription: string;
  onMetaDescription: (v: string) => void;
  keywords: string;
  onKeywords: (v: string) => void;
  faqs: Faq[];
  onFaqs: (v: Faq[]) => void;
  schemaJson: string;
  onSchemaJson: (v: string) => void;
  /** Shown in the preview when the meta fields are left empty, because that is
   *  what the live page falls back to. */
  fallbackTitle: string;
  fallbackDescription: string;
  slug: string;
}) {
  const [showSchema, setShowSchema] = useState(() => schemaJson.trim().length > 0);

  const schemaProblem = useMemo(() => {
    const result = checkJsonLd(schemaJson);
    return result.ok ? null : result.error;
  }, [schemaJson]);

  function setFaq(index: number, patch: Partial<Faq>) {
    onFaqs(faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function insertTemplate(json: string) {
    const existing = schemaJson.trim();
    if (!existing) return onSchemaJson(json);

    /* Already has something: make it a list rather than overwriting work.
     * If the existing text is too broken to parse, the two are stacked with a
     * blank line so nothing is lost and the author can see both. */
    const current = checkJsonLd(existing);
    if (!current.ok) return onSchemaJson(`${existing}\n\n${json}`);
    const list = Array.isArray(current.value) ? current.value : [current.value];
    onSchemaJson(JSON.stringify([...list, JSON.parse(json)], null, 2));
  }

  return (
    <div className="space-y-5">
      <section className={sectionClass}>
        <h3 className="text-sm font-semibold text-foreground">Search engines</h3>
        <p className="mt-1 text-xs text-muted">
          Leave any of these empty and the post&rsquo;s own title and summary are used instead.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className={labelClass}>Meta title</span>
              <Counter value={metaTitle} ideal={META_TITLE_IDEAL} />
            </span>
            <input
              id="post-meta-title"
              value={metaTitle}
              onChange={(e) => onMetaTitle(e.target.value)}
              placeholder={fallbackTitle || "The headline shown in Google"}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className={labelClass}>Meta description</span>
              <Counter value={metaDescription} ideal={META_DESCRIPTION_IDEAL} />
            </span>
            <textarea
              id="post-meta-description"
              value={metaDescription}
              onChange={(e) => onMetaDescription(e.target.value)}
              rows={2}
              placeholder={fallbackDescription || "The grey text under the title in Google"}
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Meta keywords</span>
            <input
              id="post-meta-keywords"
              value={keywords}
              onChange={(e) => onKeywords(e.target.value)}
              placeholder="NAS storage, RAID 5, Synology"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-muted">
              Separate with commas. Google ignores these; other engines and our own schema still read them.
            </span>
          </label>

          <GooglePreview
            title={metaTitle.trim() || fallbackTitle}
            description={metaDescription.trim() || fallbackDescription}
            slug={slug}
          />
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Questions &amp; answers</h3>
          <span className="text-xs text-muted">
            {faqs.length}/{MAX_FAQS}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          These appear at the end of the post and are sent to Google as FAQ markup. Google only accepts the markup when
          the answers are on the page, so the two always go together.
        </p>

        {faqs.length ? (
          <ul className="mt-4 space-y-3">
            {faqs.map((faq, i) => (
              <li key={i} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-medium tabular-nums text-muted">{i + 1}</span>
                  <div className="flex-1 space-y-2">
                    <input
                      value={faq.question}
                      onChange={(e) => setFaq(i, { question: e.target.value })}
                      placeholder="Which RAID level should I choose?"
                      aria-label={`Question ${i + 1}`}
                      className={inputClass}
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => setFaq(i, { answer: e.target.value })}
                      rows={2}
                      placeholder="The answer, in a sentence or two."
                      aria-label={`Answer ${i + 1}`}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onFaqs(faqs.filter((_, at) => at !== i))}
                    aria-label={`Remove question ${i + 1}`}
                    className="rounded-full px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-tint"
                  >
                    Remove
                  </button>
                </div>
                {faq.question.trim() && !faq.answer.trim() ? (
                  <p className="mt-2 text-xs text-accent">This question needs an answer, or it won&rsquo;t be saved.</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => onFaqs([...faqs, { question: "", answer: "" }])}
          disabled={faqs.length >= MAX_FAQS}
          className="mt-3 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          + Add a question
        </button>
      </section>

      <section className={sectionClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Custom schema</h3>
          <button
            type="button"
            onClick={() => setShowSchema((v) => !v)}
            className="text-xs font-medium text-accent transition-colors hover:underline"
          >
            {showSchema ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Every post already gets article and breadcrumb markup. This is for anything extra.
        </p>

        {showSchema ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {SCHEMA_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insertTemplate(t.json)}
                  title={t.hint}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  + {t.label}
                </button>
              ))}
            </div>

            <textarea
              id="post-schema"
              value={schemaJson}
              onChange={(e) => onSchemaJson(e.target.value)}
              rows={10}
              spellCheck={false}
              placeholder='{ "@type": "HowTo", "name": "…" }'
              aria-invalid={schemaProblem ? true : undefined}
              className={`${inputClass} resize-y font-mono text-xs ${schemaProblem ? "border-accent" : ""}`}
            />

            {schemaProblem ? (
              <p role="alert" className="text-xs text-accent">
                {schemaProblem} The post can&rsquo;t be saved until this is fixed.
              </p>
            ) : schemaJson.trim() ? (
              <p className="text-xs text-muted">Valid. It will be added to the post as structured data.</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
