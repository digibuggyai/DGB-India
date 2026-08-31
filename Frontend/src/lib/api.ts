// Thin REST client for the standalone Payload backend. Frontend and Backend
// are separate deployments now, so all content comes over HTTP instead of
// Payload's in-process Local API — see Backend's payload.config.ts `cors`.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Revalidate content periodically (ISR) rather than fetching fresh on every
// request. Lower this (or pass `revalidate: 0` per-call) for content that
// needs to feel closer to live.
const DEFAULT_REVALIDATE = 60;

type WhereClause = Record<string, Record<string, string | number | boolean>>;

export type FindParams = {
  where?: WhereClause;
  limit?: number;
  depth?: number;
  sort?: string;
  revalidate?: number;
};

export type FindResult<T> = {
  docs: T[];
  totalDocs: number;
};

function buildQuery(params: FindParams): string {
  const sp = new URLSearchParams();
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  if (params.depth !== undefined) sp.set("depth", String(params.depth));
  if (params.sort) sp.set("sort", params.sort);
  if (params.where) {
    for (const [field, ops] of Object.entries(params.where)) {
      for (const [op, value] of Object.entries(ops)) {
        sp.set(`where[${field}][${op}]`, String(value));
      }
    }
  }
  return sp.toString();
}

export async function payloadFind<T>(collection: string, params: FindParams = {}): Promise<FindResult<T>> {
  const qs = buildQuery(params);
  const res = await fetch(`${API_URL}/api/${collection}${qs ? `?${qs}` : ""}`, {
    next: { revalidate: params.revalidate ?? DEFAULT_REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`Payload API error fetching "${collection}": ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function payloadGlobal<T>(slug: string, depth = 1, revalidate = DEFAULT_REVALIDATE): Promise<T> {
  const res = await fetch(`${API_URL}/api/globals/${slug}?depth=${depth}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Payload API error fetching global "${slug}": ${res.status} ${res.statusText}`);
  }
  return res.json();
}
