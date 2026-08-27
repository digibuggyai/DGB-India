import { cache } from "react";
import { getPayload } from "@/lib/payload";

export const getSiteSettings = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "site-settings" });
});

export const getNavigation = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "navigation" });
});

export const getCTABlocks = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "cta-blocks" });
});

export const getCTABlock = async (key: string) => {
  const { blocks } = await getCTABlocks();
  return blocks?.find((b) => b.key === key) ?? null;
};

export const getIndustries = cache(async () => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "industries",
    limit: 50,
    depth: 1,
  });
  return res.docs;
});

export const getIndustryBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "industries",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getInfrastructure = cache(async () => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "infrastructure",
    limit: 100,
    depth: 1,
  });
  return res.docs;
});

export const getInfrastructureBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "infrastructure",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getInfrastructureChildren = cache(async (parentId: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "infrastructure",
    where: { parent: { equals: parentId } },
    limit: 20,
    depth: 0,
  });
  return res.docs;
});

export const getWorkloadBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "workloads",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getCaseStudies = cache(async (limit = 20) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "case-studies",
    limit,
    depth: 1,
    sort: "-publishedAt",
  });
  return res.docs;
});

export const getCaseStudyBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "case-studies",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getPosts = cache(async (type?: "blog" | "insight", limit = 20) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "posts",
    where: type ? { type: { equals: type } } : undefined,
    limit,
    depth: 1,
    sort: "-publishedAt",
  });
  return res.docs;
});

export const getPostBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const res = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getTestimonials = cache(async (limit = 10) => {
  const payload = await getPayload();
  const res = await payload.find({ collection: "testimonials", limit, depth: 1 });
  return res.docs;
});

export const getPartners = cache(async () => {
  const payload = await getPayload();
  const res = await payload.find({ collection: "partners", limit: 50, depth: 0 });
  return res.docs;
});
