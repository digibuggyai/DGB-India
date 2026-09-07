import "server-only";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export const ADMIN_COOKIE = "admin_session";

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "editor" | "sales" | "service";
};

// Roles allowed to sign in through the frontend admin login — staff who
// need to see leads, not the "service" account used by the contact form.
const ALLOWED_ROLES = new Set(["admin", "sales"]);

export async function getAdminUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `JWT ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  const user = data?.user;
  if (!user || !ALLOWED_ROLES.has(user.role)) return null;
  return user as AdminUser;
}

export async function getAdminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value ?? null;
}
