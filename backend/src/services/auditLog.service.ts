import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

export async function recordAudit(action: string, target?: string, meta?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({ data: { action, target, meta: (meta ?? {}) as any } });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log");
  }
}
