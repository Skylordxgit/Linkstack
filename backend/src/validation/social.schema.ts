import { z } from "zod";

export const createSocialSchema = z.object({
  platform: z.string().min(1).max(40),
  url: z.string().min(1).max(2000),
  enabled: z.boolean().optional(),
});

export const updateSocialSchema = createSocialSchema.partial();

export const reorderSocialsSchema = z.object({
  order: z.array(z.string()).min(1),
});
