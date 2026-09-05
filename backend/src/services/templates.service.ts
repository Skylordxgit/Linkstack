import { prisma } from "../config/prisma";

type BlockSeed = {
  type: "LINK" | "HEADING" | "TEXT" | "DIVIDER" | "SPACER" | "IMAGE" | "VIDEO" | "CONTACT" | "SOCIAL_ICONS";
  title?: string;
  url?: string;
  description?: string;
  icon?: string;
  enabled?: boolean;
  featured?: boolean;
  animation?: string;
  config?: Record<string, unknown>;
};

type SocialSeed = { platform: string; url: string; enabled?: boolean };

export interface TemplateSnapshot {
  pageDefaults?: Record<string, unknown>;
  blocks?: BlockSeed[];
  socialLinks?: SocialSeed[];
}

export const BUILT_IN_TEMPLATES: Record<string, TemplateSnapshot> = {
  blank: {
    pageDefaults: { theme: "minimal-dark" },
    blocks: [],
    socialLinks: [],
  },
  contact: {
    pageDefaults: { theme: "ocean-glass", subtitle: "Get in touch" },
    blocks: [
      { type: "HEADING", title: "Contact us", enabled: true },
      { type: "CONTACT", title: "Call us", icon: "phone", config: { kind: "phone" }, enabled: true },
      { type: "CONTACT", title: "Email us", icon: "mail", config: { kind: "email" }, enabled: true },
      { type: "LINK", title: "WhatsApp", icon: "whatsapp", url: "https://wa.me/10000000000", enabled: true },
    ],
    socialLinks: [],
  },
  social: {
    pageDefaults: { theme: "aurora-glass", subtitle: "Follow me everywhere" },
    blocks: [{ type: "SOCIAL_ICONS", title: "Follow", enabled: true }],
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/" },
      { platform: "youtube", url: "https://youtube.com/" },
      { platform: "tiktok", url: "https://tiktok.com/" },
    ],
  },
  business: {
    pageDefaults: { theme: "midnight-glass", subtitle: "Official links" },
    blocks: [
      { type: "LINK", title: "Our Website", icon: "globe", url: "https://example.com", featured: true, enabled: true },
      { type: "LINK", title: "WhatsApp Support", icon: "whatsapp", url: "https://wa.me/10000000000", enabled: true },
      { type: "SOCIAL_ICONS", title: "Follow us", enabled: true },
    ],
    socialLinks: [
      { platform: "facebook", url: "https://facebook.com/" },
      { platform: "instagram", url: "https://instagram.com/" },
    ],
  },
  support: {
    pageDefaults: { theme: "crystal", subtitle: "We're here to help" },
    blocks: [
      { type: "HEADING", title: "Need help?", enabled: true },
      { type: "LINK", title: "Live Chat (Telegram)", icon: "telegram", url: "https://t.me/", featured: true, enabled: true },
      { type: "CONTACT", title: "Support Email", icon: "mail", config: { kind: "email" }, enabled: true },
      { type: "TEXT", description: "Support hours: 9am - 9pm, 7 days a week.", enabled: true },
    ],
    socialLinks: [],
  },
  affiliate: {
    pageDefaults: { theme: "neon-glass", subtitle: "Exclusive offers" },
    blocks: [
      { type: "LINK", title: "Join Now", icon: "star", url: "https://example.com/signup", featured: true, animation: "glow", enabled: true },
      { type: "LINK", title: "Telegram Channel", icon: "telegram", url: "https://t.me/", enabled: true },
      { type: "LINK", title: "WhatsApp", icon: "whatsapp", url: "https://wa.me/10000000000", enabled: true },
      { type: "SOCIAL_ICONS", title: "Socials", enabled: true },
    ],
    socialLinks: [{ platform: "youtube", url: "https://youtube.com/" }],
  },
  creator: {
    pageDefaults: { theme: "sunset", subtitle: "Content creator" },
    blocks: [
      { type: "LINK", title: "Latest Video", icon: "youtube", url: "https://youtube.com/", featured: true, enabled: true },
      { type: "LINK", title: "Merch Store", icon: "globe", url: "https://example.com/store", enabled: true },
      { type: "SOCIAL_ICONS", title: "Follow", enabled: true },
    ],
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/" },
      { platform: "tiktok", url: "https://tiktok.com/" },
      { platform: "youtube", url: "https://youtube.com/" },
    ],
  },
};

export async function applyTemplate(templateKey: string): Promise<TemplateSnapshot | null> {
  if (BUILT_IN_TEMPLATES[templateKey]) return BUILT_IN_TEMPLATES[templateKey];

  const saved = await prisma.template.findUnique({ where: { id: templateKey } });
  if (saved) return saved.snapshot as unknown as TemplateSnapshot;

  return null;
}

export function listBuiltInTemplates() {
  return Object.entries(BUILT_IN_TEMPLATES).map(([key, snapshot]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    isBuiltIn: true,
    blockCount: snapshot.blocks?.length ?? 0,
  }));
}
