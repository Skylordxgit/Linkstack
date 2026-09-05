import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export interface AuthedRequest extends Request {
  adminId?: string;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return next(AppError.unauthorized());

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.adminId = payload.sub;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired session"));
  }
}
