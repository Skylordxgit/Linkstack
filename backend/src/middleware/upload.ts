import multer from "multer";
import { env } from "../config/env";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

// Buffered in memory, never written to local disk — uploads go straight to
// Supabase Storage, which is required on serverless runtimes (Netlify
// Functions) with no persistent filesystem.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Unsupported file type") as any);
      return;
    }
    cb(null, true);
  },
});
