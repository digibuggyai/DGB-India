import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { getNavigation, getSiteSettings } from "@/lib/content";

export async function Footer() {
  const [nav, settings] = await Promise.all([getNavigation(), getSiteSettings()]);

  const columns = nav?.footerColumns?.length
    ? nav.footerColumns
    : defaultColumns;

  return (
    <footer className="bg-ink-900 text-ink-muted">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="font-display flex items-center gap-2.5 text-lg font-semibold text-white">
            <Logo className="h-7 w-7 text-accent" />
            {settings?.siteName || "Digibuggy Enterprise"}
          </Link>
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            {settings?.tagline || "Your Workload. Our Infrastructure."} We design, engineer and
            support the compute, storage, networking and data-protection infrastructure behind
            demanding workloads.
          </p>
          <p className="mt-4 max-w-xs text-sm text-ink-muted-2">
            207, Second Floor, Mansarovar Building, 90, Nehru Place, New Delhi, Delhi 110019
          </p>
          <p className="mt-4 text-sm text-ink-muted-2">
            <a href={`mailto:${settings?.contact?.email || "sales@digibuggy.com"}`} className="hover:text-white">
              {settings?.contact?.email || "sales@digibuggy.com"}
            </a>
          </p>
          <div className="mt-1 space-y-1 text-sm text-ink-muted-2">
            {["+91 9540073737", "+91 9311447394", "+91 8077121592"].map((phone) => (
              <p key={phone}>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white">
                  {phone}
                </a>
              </p>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{col.heading}</div>
            <ul className="mt-4 space-y-2">
              {col.links?.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted-2 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#33383c]">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            {nav?.footerNote || `© ${new Date().getFullYear()} DGB India. All rights reserved.`}
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const defaultColumns = [
  {
    heading: "Infrastructure",
    links: [
      { label: "Servers", href: "/infrastructure/servers" },
      { label: "GPU Servers", href: "/infrastructure/gpu-servers" },
      { label: "Workstations", href: "/infrastructure/workstations" },
      { label: "Storage & NAS", href: "/infrastructure/storage" },
      { label: "Networking", href: "/infrastructure/networking" },
      { label: "Data Protection", href: "/infrastructure/backup" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "Architecture & Engineering", href: "/industries/architecture-engineering" },
      { label: "VFX & Animation", href: "/industries/vfx-animation" },
      { label: "AI & Machine Learning", href: "/industries/ai-machine-learning" },
      { label: "Trading & Finance", href: "/industries/trading-finance" },
      { label: "Media & Production", href: "/industries/media-production" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "How We Work", href: "/how-we-work" },
      { label: "About Us", href: "/about" },
      { label: "Resources", href: "/resources" },
      { label: "Contact", href: "/about#contact" },
    ],
  },
];
