import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { getVisitorId, parseDevice, extractUtm } from "../utils/visitor";

const PUBLIC_STATUSES = new Set(["PUBLISHED", "HIDDEN"]);

export const listIndexablePages = asyncHandler(async (_req, res) => {
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", indexable: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  res.json(pages);
});

export const getPublicPage = asyncHandler(async (req, res) => {
  const page = await prisma.page.findUnique({
    where: { slug: req.params.slug },
    include: {
      blocks: { where: { enabled: true }, orderBy: { position: "asc" } },
      socialLinks: { where: { enabled: true }, orderBy: { position: "asc" } },
    },
  });

  if (!page || !PUBLIC_STATUSES.has(page.status)) {
    throw AppError.notFound("Page not found");
  }

  res.json(page);
});

export const trackPageView = asyncHandler(async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: req.params.slug } });
  if (!page || !PUBLIC_STATUSES.has(page.status)) throw AppError.notFound("Page not found");

  const { device, browser } = parseDevice(req);
  const utm = extractUtm(req.body ?? {});

  await prisma.pageView.create({
    data: {
      pageId: page.id,
      visitorId: getVisitorId(req),
      referrer: typeof req.body?.referrer === "string" ? req.body.referrer.slice(0, 500) : undefined,
      device,
      browser,
      ...utm,
    },
  });

  res.status(201).json({ ok: true });
});

export const redirectLink = asyncHandler(async (req, res) => {
  const block = await prisma.block.findUnique({ where: { id: req.params.linkId }, include: { page: true } });

  if (!block || !block.url || !block.enabled || !PUBLIC_STATUSES.has(block.page.status)) {
    throw AppError.notFound("Link not found");
  }

  const { device, browser } = parseDevice(req);
  const utm = extractUtm(req.query as Record<string, unknown>);

  await prisma.linkClick.create({
    data: {
      pageId: block.pageId,
      blockId: block.id,
      visitorId: getVisitorId(req),
      referrer: (req.headers.referer as string | undefined)?.slice(0, 500),
      device,
      browser,
      ...utm,
    },
  });

  res.redirect(302, block.url);
});
