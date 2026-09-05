import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { recordAudit } from "../services/auditLog.service";
import type { AuthedRequest } from "../middleware/requireAuth";

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  siteName: "My Links",
  siteUrl: "http://localhost:3000",
  defaultSeoTitle: "My Links",
  defaultSeoDescription: "All my links in one place.",
  defaultTheme: "aurora-glass",
  timezone: "UTC",
  analyticsRetentionDays: 365,
  maxUploadSizeMb: 10,
};

export const getSettings = asyncHandler(async (_req, res) => {
  const rows = await prisma.setting.findMany();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json({ ...DEFAULT_SETTINGS, ...stored });
});

const updateSettingsSchema = z.record(z.any());

export const updateSettings = asyncHandler(async (req, res) => {
  const body = updateSettingsSchema.parse(req.body);

  await prisma.$transaction(
    Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      })
    )
  );

  await recordAudit("settings.updated", undefined, { keys: Object.keys(body) });
  const rows = await prisma.setting.findMany();
  res.json({ ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const changePassword = asyncHandler(async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const admin = await prisma.admin.findUnique({ where: { id: req.adminId! } });
  if (!admin) throw AppError.unauthorized();

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) throw AppError.badRequest("Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });

  await recordAudit("admin.password_changed", admin.email);
  res.json({ ok: true });
});
