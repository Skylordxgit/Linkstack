import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { isSafeUrl } from "../utils/url";
import { recordAudit } from "../services/auditLog.service";
import { createBlockSchema, updateBlockSchema, reorderBlocksSchema } from "../validation/block.schema";

export const listBlocks = asyncHandler(async (req, res) => {
  const blocks = await prisma.block.findMany({
    where: { pageId: req.params.pageId },
    orderBy: { position: "asc" },
  });
  res.json(blocks);
});

export const createBlock = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof createBlockSchema>;
  const page = await prisma.page.findUnique({ where: { id: req.params.pageId } });
  if (!page) throw AppError.notFound("Page not found");

  if (body.url && !isSafeUrl(body.url)) {
    throw AppError.badRequest("URL scheme is not allowed");
  }

  const maxPos = await prisma.block.aggregate({
    where: { pageId: page.id },
    _max: { position: true },
  });

  const block = await prisma.block.create({
    data: {
      ...body,
      pageId: page.id,
      position: (maxPos._max.position ?? -1) + 1,
    } as any,
  });

  await recordAudit("block.created", block.id, { pageId: page.id, type: block.type });
  res.status(201).json(block);
});

export const updateBlock = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updateBlockSchema>;
  const existing = await prisma.block.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Block not found");

  if (body.url && !isSafeUrl(body.url)) {
    throw AppError.badRequest("URL scheme is not allowed");
  }

  const block = await prisma.block.update({ where: { id: existing.id }, data: body as any });
  res.json(block);
});

export const deleteBlock = asyncHandler(async (req, res) => {
  const existing = await prisma.block.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Block not found");

  await prisma.block.delete({ where: { id: existing.id } });
  await recordAudit("block.deleted", existing.id, { pageId: existing.pageId });
  res.json({ ok: true });
});

export const duplicateBlock = asyncHandler(async (req, res) => {
  const existing = await prisma.block.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Block not found");

  const maxPos = await prisma.block.aggregate({
    where: { pageId: existing.pageId },
    _max: { position: true },
  });

  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = existing;
  const copy = await prisma.block.create({
    data: { ...rest, position: (maxPos._max.position ?? -1) + 1 } as any,
  });
  res.status(201).json(copy);
});

export const reorderBlocks = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof reorderBlocksSchema>;

  await prisma.$transaction(
    body.order.map((id, index) => prisma.block.update({ where: { id }, data: { position: index } }))
  );

  res.json({ ok: true });
});
