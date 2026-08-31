import type { MetadataRoute } from "next";
import {
  getIndustries,
  getInfrastructure,
  getPosts,
  getCaseStudies,
} from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/infrastructure",
    "/industries",
    "/how-we-work",
    "/about",
    "/resources",
    "/resources/blog",
    "/resources/case-studies",
    "/resources/insights",
    "/contact",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const [industries, infrastructure, blogs, insights, caseStudies] = await Promise.all([
    getIndustries(),
    getInfrastructure(),
    getPosts("blog", 200),
    getPosts("insight", 200),
    getCaseStudies(200),
  ]);

  const dynamicRoutes = [
    ...industries.map((i) => ({ url: `${base}/industries/${i.slug}`, lastModified: i.updatedAt })),
    ...infrastructure.map((i) => ({ url: `${base}/infrastructure/${i.slug}`, lastModified: i.updatedAt })),
    ...blogs.map((p) => ({ url: `${base}/resources/blog/${p.slug}`, lastModified: p.updatedAt })),
    ...insights.map((p) => ({ url: `${base}/resources/insights/${p.slug}`, lastModified: p.updatedAt })),
    ...caseStudies.map((c) => ({ url: `${base}/resources/case-studies/${c.slug}`, lastModified: c.updatedAt })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
