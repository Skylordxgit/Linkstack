import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

function resolveRange(req: any): { from: Date; to: Date } {
  const now = new Date();
  const to = req.query.to ? new Date(req.query.to as string) : now;
  const range = (req.query.range as string) || "30d";

  if (req.query.from) {
    return { from: new Date(req.query.from as string), to };
  }

  const from = new Date(to);
  switch (range) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "30d":
    default:
      from.setDate(from.getDate() - 30);
      break;
  }
  return { from, to };
}

async function summarize(where: { pageId?: string; from: Date; to: Date }) {
  const viewWhere = {
    createdAt: { gte: where.from, lte: where.to },
    ...(where.pageId ? { pageId: where.pageId } : {}),
  };
  const clickWhere = viewWhere;

  const [totalViews, uniqueVisitors, totalClicks, topReferrers, devices, browsers, utmCampaigns, topPages, topLinks] =
    await Promise.all([
      prisma.pageView.count({ where: viewWhere }),
      prisma.pageView.findMany({ where: viewWhere, select: { visitorId: true }, distinct: ["visitorId"] }).then((r) => r.length),
      prisma.linkClick.count({ where: clickWhere }),
      prisma.pageView.groupBy({ by: ["referrer"], where: { ...viewWhere, referrer: { not: null } }, _count: { _all: true }, orderBy: { _count: { referrer: "desc" } }, take: 10 }),
      prisma.pageView.groupBy({ by: ["device"], where: viewWhere, _count: { _all: true } }),
      prisma.pageView.groupBy({ by: ["browser"], where: viewWhere, _count: { _all: true } }),
      prisma.pageView.groupBy({ by: ["utmCampaign"], where: { ...viewWhere, utmCampaign: { not: null } }, _count: { _all: true }, orderBy: { _count: { utmCampaign: "desc" } }, take: 10 }),
      prisma.pageView.groupBy({ by: ["pageId"], where: viewWhere, _count: { _all: true }, orderBy: { _count: { pageId: "desc" } }, take: 10 }),
      prisma.linkClick.groupBy({ by: ["blockId"], where: clickWhere, _count: { _all: true }, orderBy: { _count: { blockId: "desc" } }, take: 10 }),
    ]);

  const pageIds = topPages.map((p) => p.pageId);
  const blockIds = topLinks.map((l) => l.blockId);
  const [pages, blocks] = await Promise.all([
    prisma.page.findMany({ where: { id: { in: pageIds } }, select: { id: true, name: true, slug: true } }),
    prisma.block.findMany({ where: { id: { in: blockIds } }, select: { id: true, title: true, pageId: true } }),
  ]);
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const blockMap = new Map(blocks.map((b) => [b.id, b]));

  return {
    totalViews,
    uniqueVisitors,
    totalClicks,
    ctr: totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(2)) : 0,
    topReferrers: topReferrers.map((r) => ({ referrer: r.referrer, count: r._count._all })),
    devices: devices.map((d) => ({ device: d.device ?? "unknown", count: d._count._all })),
    browsers: browsers.map((b) => ({ browser: b.browser ?? "unknown", count: b._count._all })),
    utmCampaigns: utmCampaigns.map((u) => ({ campaign: u.utmCampaign, count: u._count._all })),
    topPages: topPages.map((p) => ({ page: pageMap.get(p.pageId), views: p._count._all })),
    topLinks: topLinks.map((l) => ({ block: blockMap.get(l.blockId), clicks: l._count._all })),
  };
}

export const globalAnalytics = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req);
  const summary = await summarize({ from, to });
  res.json({ range: { from, to }, ...summary });
});

export const pageAnalytics = asyncHandler(async (req, res) => {
  const { from, to } = resolveRange(req);
  const summary = await summarize({ pageId: req.params.id, from, to });
  res.json({ range: { from, to }, ...summary });
});
