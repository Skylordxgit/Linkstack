import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";

const router = Router();

router.get("/", analyticsController.globalAnalytics);
router.get("/pages/:id", analyticsController.pageAnalytics);

export default router;
