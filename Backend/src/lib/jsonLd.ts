/* Checking hand-written JSON-LD before it reaches a page.
 *
 * The blog editor lets an author paste their own schema. Whatever they paste is
 * printed into a <script type="application/ld+json"> tag on the live post, so
 * it is checked here as well as in the browser: the admin panel is not the only
 * way into the CMS, and a broken blob would either be ignored by Google or, if
 * it contained a closing tag, break out of the script element entirely.
 *
 * The rules are deliberately shallow. Schema.org has hundreds of types and
 * validating them properly is Google's job, not ours — this catches the
 * mistakes that make the markup worthless or unsafe, and lets everything else
 * through. */

export const SCHEMA_MAX_CHARS = 20000;

export type SchemaCheck = { ok: true; value: unknown } | { ok: false; error: string };

/** `</script` in any casing ends the script element early, so the rest of the
 *  page would be parsed as markup. Payload escapes on output, but a second
 *  guard here costs nothing and the failure is silent otherwise. */
const CLOSING_TAG = /<\/script/i;

function checkEntry(entry: unknown, where: string): string | null {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return `${where} should be an object describing one thing.`;
  }
  const type = (entry as Record<string, unknown>)["@type"];
  if (typeof type !== "string" || !type.trim()) {
    return `${where} needs an "@type", for example "HowTo" or "Product".`;
  }
  return null;
}

/**
 * Parses and sanity-checks a block of JSON-LD.
 *
 * Accepts a single object or an array of them, with or without "@context" —
 * the renderer adds the context when it is missing, since leaving it out is the
 * single most common mistake and an easy one to fix for the author.
 */
export function checkJsonLd(raw: string): SchemaCheck {
  const text = raw.trim();
  if (!text) return { ok: true, value: null };

  if (text.length > SCHEMA_MAX_CHARS) {
    return { ok: false, error: `That is longer than ${SCHEMA_MAX_CHARS.toLocaleString()} characters.` };
  }
  if (CLOSING_TAG.test(text)) {
    return { ok: false, error: "Schema can't contain a closing </script> tag." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: `That isn't valid JSON: ${err instanceof Error ? err.message : "check the brackets and commas"}.` };
  }

  if (Array.isArray(parsed)) {
    if (!parsed.length) return { ok: false, error: "The list is empty — remove it, or add a schema to it." };
    for (let i = 0; i < parsed.length; i++) {
      const problem = checkEntry(parsed[i], `Item ${i + 1}`);
      if (problem) return { ok: false, error: problem };
    }
    return { ok: true, value: parsed };
  }

  const problem = checkEntry(parsed, "The schema");
  return problem ? { ok: false, error: problem } : { ok: true, value: parsed };
}

/** Adds "@context" where the author left it out, so the markup is valid as
 *  written rather than quietly ignored by search engines. */
export function withContext(value: unknown): unknown {
  const add = (entry: unknown) =>
    entry && typeof entry === "object" && !Array.isArray(entry) && !("@context" in entry)
      ? { "@context": "https://schema.org", ...(entry as Record<string, unknown>) }
      : entry;
  return Array.isArray(value) ? value.map(add) : add(value);
}
