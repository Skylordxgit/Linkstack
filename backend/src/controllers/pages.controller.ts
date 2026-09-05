import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { isReservedSlug, isValidSlug } from "../utils/slug";
import { recordAudit } from "../services/auditLog.service";
import {
  createPageSchema,
  updatePageSchema,
  duplicatePageSchema,
  listPagesQuerySchema,
} from "../validation/page.schema";
import { applyTemplate } from "../services/templates.service";

async function assertSlugAvailable(slug: string, excludePageId?: string) {
  if (!isValidSlug(slug)) {
    throw AppError.badRequest("Slug must be lowercase letters, numbers, hyphens or underscores (2-64 chars)");
  }
  if (isReservedSlug(slug)) {
    throw AppError.badRequest(`"${slug}" is a reserved slug`);
  }
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing && existing.id !== excludePageId) {
    throw AppError.conflict(`Slug "${slug}" is already in use`);
  }
}

export const listPages = asyncHandler(async (req, res) => {
  const query = req.query as unknown as z.infer<typeof listPagesQuerySchema>;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 50;

  const where: any = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    // MySQL's default utf8mb4_*_ci collation already makes `contains` case-insensitive;
    // the `mode: "insensitive"` filter option is Postgres-only and errors on MySQL.
    where.OR = [
      { name: { contains: query.search } },
      { slug: { contains: query.search } },
      { title: { contains: query.search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { blocks: true } },
      },
    }),
    prisma.page.count({ where }),
  ]);

  const pageIds = items.map((p) => p.id);
  const [viewCounts, clickCounts] = await Promise.all([
    prisma.pageView.groupBy({ by: ["pageId"], where: { pageId: { in: pageIds } }, _count: { _all: true } }),
    prisma.linkClick.groupBy({ by: ["pageId"], where: { pageId: { in: pageIds } }, _count: { _all: true } }),
  ]);
  const viewsByPage = new Map(viewCounts.map((v) => [v.pageId, v._count._all]));
  const clicksByPage = new Map(clickCounts.map((c) => [c.pageId, c._count._all]));

  res.json({
    items: items.map((p) => {
      const views = viewsByPage.get(p.id) ?? 0;
      const clicks = clicksByPage.get(p.id) ?? 0;
      return {
        ...p,
        blockCount: p._count.blocks,
        views,
        clicks,
        ctr: views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0,
      };
    }),
    total,
    page,
    pageSize,
  });
});

export const getPage = asyncHandler(async (req, res) => {
  const page = await prisma.page.findUnique({
    where: { id: req.params.id },
    include: {
      blocks: { orderBy: { position: "asc" } },
      socialLinks: { orderBy: { position: "asc" } },
    },
  });
  if (!page) throw AppError.notFound("Page not found");
  res.json(page);
});

export const createPage = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof createPageSchema>;
  await assertSlugAvailable(body.slug);

  const templateData = body.template ? await applyTemplate(body.template) : null;

  const page = await prisma.page.create({
    data: {
      name: body.name,
      title: body.title,
      slug: body.slug,
      templateSource: body.template,
      ...(templateData?.pageDefaults ?? {}),
    },
  });

  if (templateData?.blocks?.length) {
    await prisma.block.createMany({
      data: templateData.blocks.map((b, i) => ({ ...b, pageId: page.id, position: i })) as any,
    });
  }
  if (templateData?.socialLinks?.length) {
    await prisma.socialLink.createMany({
      data: templateData.socialLinks.map((s, i) => ({ ...s, pageId: page.id, position: i })) as any,
    });
  }

  await recordAudit("page.created", page.slug, { pageId: page.id });
  res.status(201).json(page);
});

export const updatePage = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updatePageSchema>;
  const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Page not found");

  if (body.slug && body.slug !== existing.slug) {
    await assertSlugAvailable(body.slug, existing.id);
    await recordAudit("page.slug_changed", existing.slug, { pageId: existing.id, newSlug: body.slug });
  }

  const page = await prisma.page.update({
    where: { id: existing.id },
    data: body as any,
  });

  await recordAudit("page.updated", page.slug, { pageId: page.id });
  res.json(page);
});

export const deletePage = asyncHandler(async (req, res) => {
  const existing = await prisma.page.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Page not found");

  await prisma.page.delete({ where: { id: existing.id } });
  await recordAudit("page.deleted", existing.slug, { pageId: existing.id });
  res.json({ ok: true });
});

export const duplicatePage = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof duplicatePageSchema>;
  const source = await prisma.page.findUnique({
    where: { id: req.params.id },
    include: { blocks: { orderBy: { position: "asc" } }, socialLinks: { orderBy: { position: "asc" } } },
  });
  if (!source) throw AppError.notFound("Page not found");

  await assertSlugAvailable(body.slug);

  const {
    id: _id,
    createdAt: _c,
    updatedAt: _u,
    blocks,
    socialLinks,
    ...rest
  } = source as any;

  const newPage = await prisma.page.create({
    data: {
      ...rest,
      name: body.name,
      slug: body.slug,
      status: "DRAFT",
    },
  });

  if (blocks.length) {
    await prisma.block.createMany({
      data: blocks.map((b: any) => {
        const { id: _bid, pageId: _pid, createdAt: _bc, updatedAt: _bu, ...bRest } = b;
        return { ...bRest, pageId: newPage.id };
      }),
    });
  }
  if (socialLinks.length) {
    await prisma.socialLink.createMany({
      data: socialLinks.map((s: any) => {
        const { id: _sid, pageId: _spid, createdAt: _sc, updatedAt: _su, ...sRest } = s;
        return { ...sRest, pageId: newPage.id };
      }),
    });
  }

  await recordAudit("page.duplicated", newPage.slug, { fromPageId: source.id, pageId: newPage.id });
  res.status(201).json(newPage);
});

async function setStatus(pageId: string, status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | "HIDDEN") {
  const page = await prisma.page.findUnique({ where: { id: pageId } });
  if (!page) throw AppError.notFound("Page not found");
  const updated = await prisma.page.update({ where: { id: pageId }, data: { status } });
  await recordAudit(`page.${status.toLowerCase()}`, updated.slug, { pageId });
  return updated;
}

export const publishPage = asyncHandler(async (req, res) => {
  res.json(await setStatus(req.params.id, "PUBLISHED"));
});
export const unpublishPage = asyncHandler(async (req, res) => {
  res.json(await setStatus(req.params.id, "DRAFT"));
});
export const archivePage = asyncHandler(async (req, res) => {
  res.json(await setStatus(req.params.id, "ARCHIVED"));
});
export const hidePage = asyncHandler(async (req, res) => {
  res.json(await setStatus(req.params.id, "HIDDEN"));
});
