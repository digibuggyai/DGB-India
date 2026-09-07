"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", href: "/admin" },
  { label: "Queries", href: "/admin/queries" },
  { label: "Content", href: "/admin/content" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        // "/admin" is only active on an exact match, otherwise every tab
        // would light up on the nested routes.
        const isActive =
          tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
