import { z } from "zod";

export const blockTypeEnum = z.enum([
  "LINK",
  "HEADING",
  "TEXT",
  "DIVIDER",
  "SPACER",
  "IMAGE",
  "VIDEO",
  "CONTACT",
  "SOCIAL_ICONS",
]);

export const createBlockSchema = z.object({
  type: blockTypeEnum,
  title: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(60).optional(),
  thumbnail: z.string().url().optional(),
  enabled: z.boolean().optional(),
  featured: z.boolean().optional(),
  animation: z.string().max(40).optional(),
  config: z.record(z.any()).optional(),
});

export const updateBlockSchema = createBlockSchema.partial();

export const reorderBlocksSchema = z.object({
  order: z.array(z.string()).min(1),
});
