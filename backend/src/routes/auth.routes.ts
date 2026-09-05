import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../utils/validate";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/login", authLimiter, validateBody(authController.loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
