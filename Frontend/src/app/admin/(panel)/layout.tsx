import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminNav } from "../_components/AdminNav";
import { LogoutButton } from "../_components/LogoutButton";

// Auth guard for every page in the panel — the login route sits outside
// this group so it stays reachable when signed out.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/admin" className="font-display flex items-center gap-2.5 text-base font-semibold tracking-tight">
            <Logo className="h-7 w-auto" />
            DGB India Enterprise
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-foreground">{user.email}</div>
              <div className="text-xs capitalize text-muted">{user.role}</div>
            </div>
            <LogoutButton />
          </div>
        </div>
        <div className="container-page">
          <AdminNav />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </>
  );
}
