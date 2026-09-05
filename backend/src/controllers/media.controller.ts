import sharp from "sharp";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { recordAudit } from "../services/auditLog.service";
import { uploadBuffer, deleteFromStorage, type UploadUsage } from "../services/storage.service";

function kindFromMime(mime: string): "image" | "video" {
  return mime.startsWith("video/") ? "video" : "image";
}

const VALID_USAGES = new Set<UploadUsage>(["avatar", "background", "thumbnail", "seo", "video", "general"]);

export const uploadMedia = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw AppError.badRequest("No file uploaded");

  const rawUsage = (req.body.usage as string) || "general";
  const usage: UploadUsage = VALID_USAGES.has(rawUsage as UploadUsage) ? (rawUsage as UploadUsage) : "general";
  const kind = kindFromMime(file.mimetype);

  let width: number | undefined;
  let height: number | undefined;
  let buffer = file.buffer;

  if (kind === "image") {
    // Re-encode through sharp to strip metadata/EXIF and normalize format; blocks disguised/malformed files.
    const image = sharp(file.buffer, { failOn: "error" }).rotate();
    const meta = await image.metadata();
    width = meta.width;
    height = meta.height;

    if (file.mimetype !== "image/gif") {
      buffer = await image.resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).toBuffer();
    }
  }

  const { url, storagePath } = await uploadBuffer(buffer, file.originalname, file.mimetype, usage);

  const media = await prisma.media.create({
    data: {
      filename: storagePath.split("/").pop()!,
      url,
      storagePath,
      mimeType: file.mimetype,
      size: buffer.length,
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

  await deleteFromStorage(media.storagePath);

  await prisma.media.delete({ where: { id: media.id } });
  await recordAudit("media.deleted", media.id);
  res.json({ ok: true });
});
