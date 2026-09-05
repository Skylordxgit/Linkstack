import { Router } from "express";
import * as mediaController from "../controllers/media.controller";
import { upload } from "../middleware/upload";
import { uploadLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/upload", uploadLimiter, upload.single("file"), mediaController.uploadMedia);
router.get("/", mediaController.listMedia);
router.delete("/:id", mediaController.deleteMedia);

export default router;
