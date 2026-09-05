import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { validateBody } from "../utils/validate";
import { listBuiltInTemplates } from "../services/templates.service";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const saved = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ builtIn: listBuiltInTemplates(), saved });
  })
);

const saveTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(300).optional(),
  pageId: z.string().min(1),
});

router.post(
  "/",
  validateBody(saveTemplateSchema),
  asyncHandler(async (req, res) => {
    const { name, description, pageId } = req.body as z.infer<typeof saveTemplateSchema>;
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { blocks: { orderBy: { position: "asc" } }, socialLinks: { orderBy: { position: "asc" } } },
    });
    if (!page) throw AppError.notFound("Page not found");

    const { id, createdAt, updatedAt, slug, blocks, socialLinks, status, ...pageDefaults } = page as any;

    const template = await prisma.template.create({
      data: {
        name,
        description,
        isBuiltIn: false,
        snapshot: {
          pageDefaults,
          blocks: blocks.map((b: any) => {
            const { id: _i, pageId: _p, createdAt: _c, updatedAt: _u, position, ...rest } = b;
            return rest;
          }),
          socialLinks: socialLinks.map((s: any) => {
            const { id: _i, pageId: _p, createdAt: _c, updatedAt: _u, position, ...rest } = s;
            return rest;
          }),
        },
      },
    });

    res.status(201).json(template);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const template = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!template) throw AppError.notFound("Template not found");
    await prisma.template.delete({ where: { id: template.id } });
    res.json({ ok: true });
  })
);

export default router;
