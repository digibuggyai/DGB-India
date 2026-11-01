export const SCHEMA_MAX_CHARS = 20000;

export type SchemaCheck = { ok: true; value: unknown } | { ok: false; error: string };

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

export function withContext(value: unknown): unknown {
  const add = (entry: unknown) =>
    entry && typeof entry === "object" && !Array.isArray(entry) && !("@context" in entry)
      ? { "@context": "https://schema.org", ...(entry as Record<string, unknown>) }
      : entry;
  return Array.isArray(value) ? value.map(add) : add(value);
}
