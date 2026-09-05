import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_PATH);
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

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

export { uploadRoot };
