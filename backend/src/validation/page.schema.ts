import { z } from "zod";

export const profileShapeEnum = z.enum(["CIRCLE", "ROUNDED", "SQUARE"]);
export const pageStatusEnum = z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]);

export const createPageSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, hyphens or underscores"),
  template: z.string().optional(),
});

export const updatePageSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  title: z.string().min(1).max(120).optional(),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)
    .optional(),
  subtitle: z.string().max(200).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  verified: z.boolean().optional(),
  profileShape: profileShapeEnum.optional(),
  profileSize: z.number().int().min(48).max(240).optional(),

  status: pageStatusEnum.optional(),
  indexable: z.boolean().optional(),

  theme: z.string().max(60).optional(),
  appearanceConfig: z.record(z.any()).optional(),
  backgroundConfig: z.record(z.any()).optional(),

  seoTitle: z.string().max(160).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
  seoImage: z.string().url().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogTitle: z.string().max(160).nullable().optional(),
  ogDescription: z.string().max(300).nullable().optional(),
  twitterCard: z.string().max(40).nullable().optional(),

  footerEnabled: z.boolean().optional(),
  footerText: z.string().max(300).nullable().optional(),
  footerLogo: z.string().url().nullable().optional(),
});

export const duplicatePageSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/),
});

export const listPagesQuerySchema = z.object({
  search: z.string().optional(),
  status: pageStatusEnum.optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});
