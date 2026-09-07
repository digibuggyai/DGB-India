import { Eyebrow } from "@/components/ui/Eyebrow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const COLLECTIONS = [
  { label: "Industries", slug: "industries", desc: "Sector pages and their content." },
  { label: "Infrastructure", slug: "infrastructure", desc: "Product and category pages." },
  { label: "Workloads", slug: "workloads", desc: "Workload profiles and requirements." },
  { label: "Applications", slug: "applications", desc: "Software the site references." },
  { label: "Case Studies", slug: "case-studies", desc: "Customer deployments and results." },
  { label: "Posts", slug: "posts", desc: "Blog articles and insights." },
  { label: "Authors", slug: "authors", desc: "Bylines for posts." },
  { label: "FAQs", slug: "faqs", desc: "Questions shown across the site." },
  { label: "Testimonials", slug: "testimonials", desc: "Customer quotes." },
  { label: "Partners", slug: "partners", desc: "Brands in the homepage logo strip." },
  { label: "Media", slug: "media", desc: "Uploaded images and files." },
  { label: "Users", slug: "users", desc: "Admin and staff accounts." },
];

const GLOBALS = [
  { label: "Site Settings", slug: "site-settings", desc: "Site name, tagline, contact details." },
  { label: "Navigation", slug: "navigation", desc: "Header and footer links." },
  { label: "CTA Blocks", slug: "cta-blocks", desc: "Reusable call-to-action copy." },
];

function ContentGrid({
  items,
  kind,
}: {
  items: { label: string; slug: string; desc: string }[];
  kind: "collections" | "globals";
}) {
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.slug}
          href={`${API_URL}/admin/${kind}/${item.slug}`}
          target="_blank"
          rel="noreferrer"
          className="group rounded-lg border border-border bg-background p-5 transition-all hover:border-accent hover:shadow-[0_18px_40px_-28px_rgba(128,32,44,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-lg font-bold tracking-tight">{item.label}</span>
            <span className="text-muted transition-colors group-hover:text-accent" aria-hidden>
              &#8599;
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">{item.desc}</p>
        </a>
      ))}
    </div>
  );
}

export default function ContentPage() {
  return (
    <div className="container-page py-10">
      <Eyebrow>Content</Eyebrow>
      <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Manage Content
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        These open the full editor in the CMS, where you can add, edit, upload images and manage
        relationships. It signs in separately the first time.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">Collections</h2>
        <p className="mt-1 text-sm text-muted">Content with many entries.</p>
        <ContentGrid items={COLLECTIONS} kind="collections" />
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl font-bold tracking-tight">Site-wide</h2>
        <p className="mt-1 text-sm text-muted">Single settings that apply across the whole site.</p>
        <ContentGrid items={GLOBALS} kind="globals" />
      </section>
    </div>
  );
}
