import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardSummary = asyncHandler(async (_req, res) => {
  const [totalPages, publishedPages, totalViews, totalClicks, recentPages, recentActivity, topPageView, topBlockClick] =
    await Promise.all([
      prisma.page.count(),
      prisma.page.count({ where: { status: "PUBLISHED" } }),
      prisma.pageView.count(),
      prisma.linkClick.count(),
      prisma.page.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
      prisma.pageView.groupBy({ by: ["pageId"], _count: { _all: true }, orderBy: { _count: { pageId: "desc" } }, take: 1 }),
      prisma.linkClick.groupBy({ by: ["blockId"], _count: { _all: true }, orderBy: { _count: { blockId: "desc" } }, take: 1 }),
    ]);

  const mostViewedPage = topPageView[0]
    ? await prisma.page.findUnique({ where: { id: topPageView[0].pageId }, select: { id: true, name: true, slug: true } })
    : null;
  const mostClickedLink = topBlockClick[0]
    ? await prisma.block.findUnique({ where: { id: topBlockClick[0].blockId }, select: { id: true, title: true, pageId: true } })
    : null;

  res.json({
    totalPages,
    publishedPages,
    totalViews,
    totalClicks,
    ctr: totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0,
    mostViewedPage: mostViewedPage ? { ...mostViewedPage, views: topPageView[0]!._count._all } : null,
    mostClickedLink: mostClickedLink ? { ...mostClickedLink, clicks: topBlockClick[0]!._count._all } : null,
    recentPages,
    recentActivity,
  });
});
