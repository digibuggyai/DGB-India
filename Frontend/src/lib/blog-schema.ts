export const SCHEMA_MAX_CHARS = 20000;
export const MAX_FAQS = 30;

export const META_TITLE_IDEAL = 60;
export const META_DESCRIPTION_IDEAL = 160;

export type Faq = { question: string; answer: string };

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
    return {
      ok: false,
      error: `That isn't valid JSON: ${err instanceof Error ? err.message : "check the brackets and commas"}.`,
    };
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

export function faqSchema(faqs: Faq[]): object | null {
  const usable = faqs.filter((f) => f.question.trim() && f.answer.trim());
  if (!usable.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usable.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: { "@type": "Answer", text: f.answer.trim() },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export const SCHEMA_TEMPLATES: { label: string; hint: string; json: string }[] = [
  {
    label: "HowTo",
    hint: "Step-by-step instructions",
    json: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to set up a NAS for a studio",
        totalTime: "PT30M",
        step: [
          { "@type": "HowToStep", name: "Fit the drives", text: "Slide each drive into a bay until it clicks." },
          { "@type": "HowToStep", name: "Create the RAID", text: "Choose RAID 5 for four or more drives." },
        ],
      },
      null,
      2,
    ),
  },
  {
    label: "Product",
    hint: "A specific unit, with a price",
    json: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Synology DS425+",
        brand: { "@type": "Brand", name: "Synology" },
        offers: { "@type": "Offer", price: "67000", priceCurrency: "INR", availability: "https://schema.org/InStock" },
      },
      null,
      2,
    ),
  },
  {
    label: "VideoObject",
    hint: "An embedded video",
    json: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: "Setting up RAID 5",
        description: "A walkthrough of the first configuration.",
        thumbnailUrl: "https://www.dgbindia.com/og.png",
        uploadDate: new Date().toISOString().slice(0, 10),
        contentUrl: "https://www.dgbindia.com/video.mp4",
      },
      null,
      2,
    ),
  },
  {
    label: "ItemList",
    hint: "A ranked or numbered list",
    json: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Synology DS425+" },
          { "@type": "ListItem", position: 2, name: "QNAP TS-464-8G" },
        ],
      },
      null,
      2,
    ),
  },
];
