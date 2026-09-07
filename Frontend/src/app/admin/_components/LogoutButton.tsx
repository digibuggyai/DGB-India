"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
    >
      Sign Out
    </button>
  );
}
