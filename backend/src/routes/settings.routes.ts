import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";

const router = Router();

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);
router.post("/change-password", settingsController.changePassword);

export default router;
