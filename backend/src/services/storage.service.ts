import crypto from "crypto";
import path from "path";
import { supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export type UploadUsage = "avatar" | "background" | "thumbnail" | "seo" | "video" | "general";

function folderFor(usage: UploadUsage): string {
  switch (usage) {
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
      return "general";
  }
}

/** Uploads a file buffer to the Supabase Storage media bucket and returns its public URL. */
export async function uploadBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  usage: UploadUsage
): Promise<{ url: string; storagePath: string }> {
  const safeName = `${crypto.randomBytes(16).toString("hex")}${path.extname(originalName).toLowerCase()}`;
  const storagePath = `${folderFor(usage)}/${safeName}`;

  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(storagePath, buffer, {
    contentType: mimeType,
    cacheControl: "2592000",
    upsert: false,
  });

  if (error) {
    throw AppError.badRequest(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);
  return { url: data.publicUrl, storagePath };
}

export async function deleteFromStorage(storagePath: string): Promise<void> {
  await supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([storagePath]);
}
