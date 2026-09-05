import { internalApiBase } from "@/lib/api";
import type { Page } from "@/types";

export async function fetchPublicPage(slug: string): Promise<Page | null> {
  const res = await fetch(`${internalApiBase()}/public/pages/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Page;
}

export interface PublicPageSummary {
  slug: string;
  updatedAt: string;
}

export async function fetchIndexablePages(): Promise<PublicPageSummary[]> {
  try {
    const res = await fetch(`${internalApiBase()}/public/pages`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as PublicPageSummary[];
  } catch {
    return [];
  }
}
