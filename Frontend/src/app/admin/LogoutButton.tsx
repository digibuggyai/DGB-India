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
      className="rounded-md border border-[#43484d] px-4 py-2 text-sm text-ink-muted-2 transition-colors hover:border-accent hover:text-white"
    >
      Sign Out
    </button>
  );
}
