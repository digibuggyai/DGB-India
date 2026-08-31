import { cache } from "react";
import { payloadFind, payloadGlobal } from "@/lib/api";
import type {
  CaseStudy,
  CtaBlock,
  Industry,
  Infrastructure,
  Navigation,
  Post,
  SiteSetting,
  Testimonial,
  Partner,
  Workload,
} from "@/payload-types";

export const getSiteSettings = cache(async () => {
  return payloadGlobal<SiteSetting>("site-settings", 1);
});

export const getNavigation = cache(async () => {
  return payloadGlobal<Navigation>("navigation", 1);
});

export const getCTABlocks = cache(async () => {
  return payloadGlobal<CtaBlock>("cta-blocks", 0);
});

export const getCTABlock = async (key: string) => {
  const { blocks } = await getCTABlocks();
  return blocks?.find((b) => b.key === key) ?? null;
};

export const getIndustries = cache(async () => {
  const res = await payloadFind<Industry>("industries", { limit: 50, depth: 1 });
  return res.docs;
});

export const getIndustryBySlug = cache(async (slug: string) => {
  const res = await payloadFind<Industry>("industries", {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getInfrastructure = cache(async () => {
  const res = await payloadFind<Infrastructure>("infrastructure", { limit: 100, depth: 1 });
  return res.docs;
});

export const getInfrastructureBySlug = cache(async (slug: string) => {
  const res = await payloadFind<Infrastructure>("infrastructure", {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getInfrastructureChildren = cache(async (parentId: string) => {
  const res = await payloadFind<Infrastructure>("infrastructure", {
    where: { parent: { equals: parentId } },
    limit: 20,
    depth: 0,
  });
  return res.docs;
});

export const getWorkloadBySlug = cache(async (slug: string) => {
  const res = await payloadFind<Workload>("workloads", {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getCaseStudies = cache(async (limit = 20) => {
  const res = await payloadFind<CaseStudy>("case-studies", { limit, depth: 1, sort: "-publishedAt" });
  return res.docs;
});

export const getCaseStudyBySlug = cache(async (slug: string) => {
  const res = await payloadFind<CaseStudy>("case-studies", {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getPosts = cache(async (type?: "blog" | "insight", limit = 20) => {
  const res = await payloadFind<Post>("posts", {
    where: type ? { type: { equals: type } } : undefined,
    limit,
    depth: 1,
    sort: "-publishedAt",
  });
  return res.docs;
});

export const getPostBySlug = cache(async (slug: string) => {
  const res = await payloadFind<Post>("posts", {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  return res.docs[0] ?? null;
});

export const getTestimonials = cache(async (limit = 10) => {
  const res = await payloadFind<Testimonial>("testimonials", { limit, depth: 1 });
  return res.docs;
});

export const getPartners = cache(async () => {
  const res = await payloadFind<Partner>("partners", { limit: 50, depth: 0 });
  return res.docs;
});
