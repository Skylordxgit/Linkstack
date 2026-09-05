import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import pagesRoutes, { blocksRouter, socialsRouter } from "./pages.routes";
import mediaRoutes from "./media.routes";
import analyticsRoutes from "./analytics.routes";
import templatesRoutes from "./templates.routes";
import settingsRoutes from "./settings.routes";
import { dashboardSummary } from "../controllers/dashboard.controller";

const router = Router();

router.use(requireAuth);

router.get("/dashboard", dashboardSummary);
router.use("/pages", pagesRoutes);
router.use("/blocks", blocksRouter);
router.use("/socials", socialsRouter);
router.use("/media", mediaRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/templates", templatesRoutes);
router.use("/settings", settingsRoutes);

export default router;
