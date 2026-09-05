import crypto from "crypto";
import type { Request } from "express";
import { UAParser } from "ua-parser-js";

/**
 * Privacy-friendly anonymous visitor id: a salted daily hash of IP + user-agent.
 * Rotates every 24h and is never reversible to the raw IP, so it identifies a
 * "unique visitor that day" without persistent cross-site fingerprinting.
 */
export function getVisitorId(req: Request): string {
  const ip = getClientIp(req);
  const ua = req.headers["user-agent"] ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.JWT_SECRET ?? "salt";
  return crypto.createHash("sha256").update(`${ip}|${ua}|${day}|${salt}`).digest("hex");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

export function parseDevice(req: Request): { device: string; browser: string } {
  const ua = req.headers["user-agent"] ?? "";
  const parser = new UAParser(ua);
  const result = parser.getResult();
  const device = result.device.type ?? "desktop";
  const browser = result.browser.name ?? "unknown";
  return { device, browser };
}

export function extractUtm(query: Record<string, unknown>) {
  return {
    utmSource: typeof query.utm_source === "string" ? query.utm_source : undefined,
    utmMedium: typeof query.utm_medium === "string" ? query.utm_medium : undefined,
    utmCampaign: typeof query.utm_campaign === "string" ? query.utm_campaign : undefined,
    utmContent: typeof query.utm_content === "string" ? query.utm_content : undefined,
  };
}
