import { getIndustries, getInfrastructure } from "@/lib/content";
import type { Infrastructure } from "@/payload-types";

export type InfraNavNode = {
  id: string;
  name: string;
  slug: string;
  category: string;
  children: { id: string; name: string; slug: string }[];
};

const CATEGORY_ORDER = ["compute", "storage", "networking", "data-protection"];
const CATEGORY_LABEL: Record<string, string> = {
  compute: "Compute",
  storage: "Storage",
  networking: "Networking",
  "data-protection": "Data Protection",
};

export async function getInfraNavTree(): Promise<{ label: string; category: string; items: InfraNavNode[] }[]> {
  const all = await getInfrastructure();

  const topLevel = all.filter((i) => !i.parent);
  const byParent = new Map<string, Infrastructure[]>();
  for (const item of all) {
    if (item.parent) {
      const parentId = typeof item.parent === "object" ? item.parent.id : item.parent;
      const list = byParent.get(String(parentId)) ?? [];
      list.push(item);
      byParent.set(String(parentId), list);
    }
  }

  const groups = CATEGORY_ORDER.map((category) => {
    const items = topLevel
      .filter((i) => i.category === category)
      .map((i) => ({
        id: String(i.id),
        name: i.name,
        slug: i.slug ?? "",
        category: i.category,
        children: (byParent.get(String(i.id)) ?? []).map((c) => ({
          id: String(c.id),
          name: c.name,
          slug: c.slug ?? "",
        })),
      }));
    return { label: CATEGORY_LABEL[category], category, items };
  }).filter((g) => g.items.length > 0);

  return groups;
}

export async function getIndustriesNav() {
  const industries = await getIndustries();
  return industries.map((i) => ({
    id: String(i.id),
    name: i.name,
    slug: i.slug ?? "",
    tagline: i.tagline ?? "",
  }));
}
