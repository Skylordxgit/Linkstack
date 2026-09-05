import { Router } from "express";
import * as publicController from "../controllers/public.controller";
import { publicApiLimiter } from "../middleware/rateLimit";

const router = Router();

router.get("/:linkId", publicApiLimiter, publicController.redirectLink);

export default router;
