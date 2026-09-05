import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadRoot } from "../middleware/upload";
import { recordAudit } from "../services/auditLog.service";

function kindFromMime(mime: string): "image" | "video" {
  return mime.startsWith("video/") ? "video" : "image";
}

function subfolder(kind: "avatar" | "background" | "thumbnail" | "seo" | "video" | "general"): string {
  switch (kind) {
    case "avatar":
      return "avatars";
    case "background":
      return "backgrounds";
    case "thumbnail":
      return "thumbnails";
    case "seo":
      return "seo";
    case "video":
      return "videos";
    default:
      return "thumbnails";
  }
}

export const uploadMedia = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw AppError.badRequest("No file uploaded");

  const usage = (req.body.usage as string) || "general";
  const folder = subfolder(usage as any);
  const kind = kindFromMime(file.mimetype);

  const safeName = `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname).toLowerCase()}`;
  const destDir = path.join(uploadRoot, folder);
  await fs.mkdir(destDir, { recursive: true });
  const destPath = path.join(destDir, safeName);

  let width: number | undefined;
  let height: number | undefined;

  if (kind === "image") {
    // Re-encode through sharp to strip metadata/EXIF and normalize format; blocks disguised/malformed files.
    const image = sharp(file.buffer, { failOn: "error" }).rotate();
    const meta = await image.metadata();
    width = meta.width;
    height = meta.height;

    if (file.mimetype === "image/gif") {
      await fs.writeFile(destPath, file.buffer);
    } else {
      await image.resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).toFile(destPath);
    }
  } else {
    await fs.writeFile(destPath, file.buffer);
  }

  const url = `/uploads/${folder}/${safeName}`;

  const media = await prisma.media.create({
    data: {
      filename: safeName,
      url,
      mimeType: file.mimetype,
      size: file.size,
      width,
      height,
      kind,
    },
  });

  await recordAudit("media.uploaded", media.id, { url });
  res.status(201).json(media);
});

export const listMedia = asyncHandler(async (req, res) => {
  const kind = req.query.kind as string | undefined;
  const media = await prisma.media.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json(media);
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: req.params.id } });
  if (!media) throw AppError.notFound("Media not found");

  const filePath = path.join(uploadRoot, media.url.replace(/^\/uploads\//, ""));
  await fs.unlink(filePath).catch(() => undefined);

  await prisma.media.delete({ where: { id: media.id } });
  await recordAudit("media.deleted", media.id);
  res.json({ ok: true });
});
