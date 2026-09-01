"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";
import type { InfraNavNode } from "@/lib/nav-data";

type IndustryNavItem = { id: string; name: string; slug: string; tagline: string };

export function HeaderClient({
  siteName,
  industries,
  infraGroups,
}: {
  siteName: string;
  industries: IndustryNavItem[];
  infraGroups: { label: string; category: string; items: InfraNavNode[] }[];
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  const close = () => setOpenMenu(null);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 40);
      // Never hide while a menu is open, and ignore tiny jitter.
      if (Math.abs(y - lastY.current) > 4) {
        setHidden(y > lastY.current && y > 120);
        lastY.current = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[transform,background-color,border-color] duration-300 ${
        hidden && !mobileOpen && !openMenu ? "-translate-y-full" : "translate-y-0"
      } ${
        atTop && !openMenu
          ? "border-transparent bg-background/80 backdrop-blur"
          : "border-border bg-background/95 backdrop-blur"
      }`}
    >

      <div className="container-page flex h-18 items-center justify-between py-4">
        <Link href="/" className="font-display flex items-center gap-2.5 text-lg font-semibold tracking-tight" onClick={close}>
          <Logo className="h-7 w-7 text-accent" />
          {siteName}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={close}>
          <NavLink href="/">Home</NavLink>

          <MenuTrigger label="Solutions" name="industries" openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="grid grid-cols-2 gap-6 p-6">
              {industries.map((ind) => (
                <Link
                  key={ind.id}
                  href={`/industries/${ind.slug}`}
                  onClick={close}
                  className="group rounded-md p-2 hover:bg-surface-raised"
                >
                  <div className="font-medium text-foreground group-hover:text-accent-2">{ind.name}</div>
                  {ind.tagline ? <div className="mt-1 text-xs text-muted">{ind.tagline}</div> : null}
                </Link>
              ))}
            </div>
          </MenuTrigger>

          <MenuTrigger label="Infrastructure" name="infrastructure" openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="grid grid-cols-4 gap-6 p-6">
              {infraGroups.map((group) => (
                <div key={group.category}>
                  <div className="font-mono text-xs uppercase tracking-wider text-muted">{group.label}</div>
                  <ul className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/infrastructure/${item.slug}`}
                          onClick={close}
                          className="text-sm text-foreground/90 hover:text-accent-2"
                        >
                          {item.name}
                        </Link>
                        {item.children.length > 0 && (
                          <ul className="mt-1 ml-3 space-y-1 border-l border-border pl-3">
                            {item.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/infrastructure/${child.slug}`}
                                  onClick={close}
                                  className="text-xs text-muted hover:text-accent-2"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </MenuTrigger>

          <NavLink href="/how-we-work">How We Work</NavLink>
          <NavLink href="/about">About Us</NavLink>

          <MenuTrigger label="Resources" name="resources" openMenu={openMenu} setOpenMenu={setOpenMenu}>
            <div className="w-56 p-3">
              {[
                ["Blogs", "/resources/blog"],
                ["Case Studies", "/resources/case-studies"],
                ["Insights", "/resources/insights"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-foreground/90 hover:bg-surface-raised hover:text-accent-2"
                >
                  {label}
                </Link>
              ))}
            </div>
          </MenuTrigger>

          <NavLink href="/contact">Contact</NavLink>
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/contact" className="text-sm">
            Talk to an Expert
          </ButtonLink>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="relative block h-3 w-4">
            <span className="absolute inset-x-0 top-0 h-px bg-foreground" />
            <span className="absolute inset-x-0 top-1.5 h-px bg-foreground" />
            <span className="absolute inset-x-0 top-3 h-px bg-foreground" />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-6 lg:hidden">
          <MobileSection title="Home" href="/" onNavigate={() => setMobileOpen(false)} />
          <MobileGroup title="Solutions" onNavigate={() => setMobileOpen(false)}>
            {industries.map((ind) => (
              <Link key={ind.id} href={`/industries/${ind.slug}`} className="block py-1.5 text-sm text-muted">
                {ind.name}
              </Link>
            ))}
          </MobileGroup>
          <MobileGroup title="Infrastructure" onNavigate={() => setMobileOpen(false)}>
            {infraGroups.flatMap((g) => g.items).map((item) => (
              <Link key={item.id} href={`/infrastructure/${item.slug}`} className="block py-1.5 text-sm text-muted">
                {item.name}
              </Link>
            ))}
          </MobileGroup>
          <MobileSection title="How We Work" href="/how-we-work" onNavigate={() => setMobileOpen(false)} />
          <MobileSection title="About Us" href="/about" onNavigate={() => setMobileOpen(false)} />
          <MobileGroup title="Resources" onNavigate={() => setMobileOpen(false)}>
            <Link href="/resources/blog" className="block py-1.5 text-sm text-muted">Blogs</Link>
            <Link href="/resources/case-studies" className="block py-1.5 text-sm text-muted">Case Studies</Link>
            <Link href="/resources/insights" className="block py-1.5 text-sm text-muted">Insights</Link>
          </MobileGroup>
          <MobileSection title="Contact" href="/contact" onNavigate={() => setMobileOpen(false)} />
          <div className="mt-4">
            <ButtonLink href="/contact" className="w-full" onClick={() => setMobileOpen(false)}>
              Talk to an Expert
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function MenuTrigger({
  label,
  name,
  openMenu,
  setOpenMenu,
  children,
}: {
  label: string;
  name: string;
  openMenu: string | null;
  setOpenMenu: (v: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = openMenu === name;
  return (
    <div className="relative" onMouseEnter={() => setOpenMenu(name)}>
      <button
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground/80 hover:text-foreground"
        onClick={() => setOpenMenu(isOpen ? null : name)}
        aria-expanded={isOpen}
      >
        {label}
        <svg width="10" height="6" viewBox="0 0 10 6" className={isOpen ? "rotate-180" : ""}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <div className="rounded-lg border border-border border-t-[3px] border-t-accent bg-background shadow-2xl shadow-black/10">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileSection({
  title,
  href,
  onNavigate,
}: {
  title: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block border-b border-border py-3 text-sm font-medium text-foreground"
    >
      {title}
    </Link>
  );
}

function MobileGroup({
  title,
  children,
}: {
  title: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border py-3">
      <button
        className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-2 pl-2">{children}</div>}
    </div>
  );
}
