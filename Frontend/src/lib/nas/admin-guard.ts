import "server-only";
import { NextResponse } from "next/server";
import { getAdminToken, getAdminUser } from "@/lib/admin-auth";
import { CmsError } from "./cms";

/** The signed-in admin and their CMS token, or null for anyone else. */
export async function requireAdmin() {
  const [user, token] = await Promise.all([getAdminUser(), getAdminToken()]);
  return user && user.role === "admin" && token ? { user, token } : null;
}

export function forbidden() {
  return NextResponse.json({ error: "Only admins can manage NAS pricing." }, { status: 403 });
}

export function cmsErrorResponse(err: unknown) {
  const status = err instanceof CmsError && err.status < 500 ? err.status : 502;
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Something went wrong." },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
