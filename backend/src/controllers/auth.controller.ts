import type { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { recordAudit } from "../services/auditLog.service";
import type { AuthedRequest } from "../middleware/requireAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setSessionCookie(res: Response, adminId: string) {
  const token = jwt.sign({ sub: adminId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export { loginSchema };

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) {
    await recordAudit("login.failed", email);
    throw AppError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await recordAudit("login.failed", email);
    throw AppError.unauthorized("Invalid email or password");
  }

  setSessionCookie(res, admin.id);
  await recordAudit("login.success", admin.email);

  res.json({ id: admin.id, email: admin.email, name: admin.name });
});

export const logout = asyncHandler(async (req: AuthedRequest, res) => {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
  await recordAudit("logout", req.adminId);
  res.json({ ok: true });
});

export const me = asyncHandler(async (req: AuthedRequest, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId! } });
  if (!admin) throw AppError.unauthorized();
  res.json({ id: admin.id, email: admin.email, name: admin.name });
});
