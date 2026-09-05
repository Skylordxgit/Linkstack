import { Router } from "express";
import * as publicController from "../controllers/public.controller";
import { publicApiLimiter } from "../middleware/rateLimit";

const router = Router();

router.get("/pages", publicApiLimiter, publicController.listIndexablePages);
router.get("/pages/:slug", publicApiLimiter, publicController.getPublicPage);
router.post("/pages/:slug/view", publicApiLimiter, publicController.trackPageView);

export default router;
