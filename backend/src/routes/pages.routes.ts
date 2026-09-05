import { Router } from "express";
import * as pagesController from "../controllers/pages.controller";
import * as blocksController from "../controllers/blocks.controller";
import * as socialsController from "../controllers/socials.controller";
import { validateBody, validateQuery } from "../utils/validate";
import {
  createPageSchema,
  updatePageSchema,
  duplicatePageSchema,
  listPagesQuerySchema,
} from "../validation/page.schema";
import { createBlockSchema, updateBlockSchema, reorderBlocksSchema } from "../validation/block.schema";
import { createSocialSchema, updateSocialSchema, reorderSocialsSchema } from "../validation/social.schema";

const router = Router();

router.get("/", validateQuery(listPagesQuerySchema), pagesController.listPages);
router.post("/", validateBody(createPageSchema), pagesController.createPage);
router.get("/:id", pagesController.getPage);
router.put("/:id", validateBody(updatePageSchema), pagesController.updatePage);
router.delete("/:id", pagesController.deletePage);
router.post("/:id/duplicate", validateBody(duplicatePageSchema), pagesController.duplicatePage);
router.post("/:id/publish", pagesController.publishPage);
router.post("/:id/unpublish", pagesController.unpublishPage);
router.post("/:id/archive", pagesController.archivePage);
router.post("/:id/hide", pagesController.hidePage);

router.get("/:pageId/blocks", blocksController.listBlocks);
router.post("/:pageId/blocks", validateBody(createBlockSchema), blocksController.createBlock);
router.post("/:pageId/blocks/reorder", validateBody(reorderBlocksSchema), blocksController.reorderBlocks);

router.get("/:pageId/socials", socialsController.listSocials);
router.post("/:pageId/socials", validateBody(createSocialSchema), socialsController.createSocial);
router.post("/:pageId/socials/reorder", validateBody(reorderSocialsSchema), socialsController.reorderSocials);

export default router;

export const blocksRouter = Router();
blocksRouter.put("/:id", validateBody(updateBlockSchema), blocksController.updateBlock);
blocksRouter.delete("/:id", blocksController.deleteBlock);
blocksRouter.post("/:id/duplicate", blocksController.duplicateBlock);

export const socialsRouter = Router();
socialsRouter.put("/:id", validateBody(updateSocialSchema), socialsController.updateSocial);
socialsRouter.delete("/:id", socialsController.deleteSocial);
