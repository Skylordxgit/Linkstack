import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { logger } from "../config/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, "Request failed");
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    error: "Internal server error",
    ...(env.isProd ? {} : { stack: err instanceof Error ? err.stack : String(err) }),
  });
}
