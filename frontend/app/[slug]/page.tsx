import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicPage } from "@/lib/public-page";
import { PageRenderer } from "@/components/public/page-renderer";
import { ViewTracker } from "@/components/public/view-tracker";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPublicPage(slug);
  if (!page) return { title: "Page not found" };

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || page.subtitle || page.bio || undefined;
  const ogTitle = page.ogTitle || title;
  const ogDescription = page.ogDescription || description;

  return {
    title,
    description,
    alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
    robots: page.indexable && page.status === "PUBLISHED" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: page.seoImage ? [{ url: page.seoImage }] : page.avatarUrl ? [{ url: page.avatarUrl }] : undefined,
      type: "profile",
    },
    twitter: {
      card: (page.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: page.seoImage ? [page.seoImage] : undefined,
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchPublicPage(slug);
  if (!page) notFound();

  return (
    <>
      <ViewTracker slug={page.slug} />
      <main className="min-h-screen w-full">
        <PageRenderer page={page} mode="public" className="min-h-screen" />
      </main>
    </>
  );
}
