const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const DEFAULT_REVALIDATE = 60;

const BUILDING = process.env.NEXT_PHASE === "phase-production-build";

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

function unreachable(what: string, err: unknown): never | null {
  const reason = err instanceof Error ? err.message : String(err);
  if (BUILDING) {
    console.warn(`[cms] ${what} could not be read during the build (${reason}). The page will fetch it on first request.`);
    return null;
  }
  throw err instanceof Error ? err : new Error(reason);
}

export async function payloadFind<T>(collection: string, params: FindParams = {}): Promise<FindResult<T>> {
  const qs = buildQuery(params);
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/${collection}${qs ? `?${qs}` : ""}`, {
      next: { revalidate: params.revalidate ?? DEFAULT_REVALIDATE },
    });
  } catch (err) {
    if (unreachable(`collection "${collection}"`, err) === null) return { docs: [], totalDocs: 0 };
    throw err;
  }
  if (!res.ok) {
    const error = new Error(`Payload API error fetching "${collection}": ${res.status} ${res.statusText}`);
    if (unreachable(`collection "${collection}"`, error) === null) return { docs: [], totalDocs: 0 };
    throw error;
  }
  return res.json();
}

export async function payloadGlobal<T>(slug: string, depth = 1, revalidate = DEFAULT_REVALIDATE): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/globals/${slug}?depth=${depth}`, {
      next: { revalidate },
    });
  } catch (err) {
    if (unreachable(`global "${slug}"`, err) === null) return {} as T;
    throw err;
  }
  if (!res.ok) {
    const error = new Error(`Payload API error fetching global "${slug}": ${res.status} ${res.statusText}`);
    if (unreachable(`global "${slug}"`, error) === null) return {} as T;
    throw error;
  }
  return res.json();
}
