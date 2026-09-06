import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { isSafeUrl } from "../utils/url";
import { createSocialSchema, updateSocialSchema, reorderSocialsSchema } from "../validation/social.schema";

export const listSocials = asyncHandler(async (req, res) => {
  const socials = await prisma.socialLink.findMany({
    where: { pageId: req.params.pageId },
    orderBy: { position: "asc" },
  });
  res.json(socials);
});

export const createSocial = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof createSocialSchema>;
  const page = await prisma.page.findUnique({ where: { id: req.params.pageId } });
  if (!page) throw AppError.notFound("Page not found");

  if (!isSafeUrl(body.url)) throw AppError.badRequest("URL scheme is not allowed");

  const maxPos = await prisma.socialLink.aggregate({ where: { pageId: page.id }, _max: { position: true } });

  const social = await prisma.socialLink.create({
    data: { ...body, pageId: page.id, position: (maxPos._max.position ?? -1) + 1 } as any,
  });
  res.status(201).json(social);
});

export const updateSocial = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updateSocialSchema>;
  const existing = await prisma.socialLink.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Social link not found");

  if (body.url && !isSafeUrl(body.url)) throw AppError.badRequest("URL scheme is not allowed");

  const social = await prisma.socialLink.update({ where: { id: existing.id }, data: body as any });
  res.json(social);
});

export const deleteSocial = asyncHandler(async (req, res) => {
  const existing = await prisma.socialLink.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Social link not found");

  await prisma.socialLink.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

export const reorderSocials = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof reorderSocialsSchema>;

  await prisma.$transaction(
    body.order.map((id, index) => prisma.socialLink.update({ where: { id }, data: { position: index } }))
  );

  res.json({ ok: true });
});
