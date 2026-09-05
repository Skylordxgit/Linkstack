export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "assets",
  "uploads",
  "analytics",
  "settings",
  "media",
  "templates",
  "go",
  "public",
  "auth",
  "demo",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "_next",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length >= 2 && slug.length <= 64;
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}
