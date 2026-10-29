import type { MetadataRoute } from "next";
import {
  getAllCategorySlugs,
  getAllSubLocalitySlugs,
  getAllListingSlugs,
} from "@/lib/search";

const BASE = "https://dhanoriyellowpages.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, areas, listings] = await Promise.all([
    getAllCategorySlugs(),
    getAllSubLocalitySlugs(),
    getAllListingSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/emergency`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/search`, changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const areaPages: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${BASE}/area/${a.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE}/listing/${l.slug}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...areaPages, ...listingPages];
}
