import type { MetadataRoute } from "next";
import { fetchIndexablePages } from "@/lib/public-page";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = await fetchIndexablePages();

  return pages.map((p) => ({
    url: `${siteUrl}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}
