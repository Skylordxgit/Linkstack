export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  placeholder: string;
  urlPrefix?: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "whatsapp", name: "WhatsApp", icon: "MessageCircle", placeholder: "https://wa.me/1234567890" },
  { id: "telegram", name: "Telegram", icon: "Send", placeholder: "https://t.me/username", urlPrefix: "https://t.me/" },
  { id: "messenger", name: "Messenger", icon: "MessageSquare", placeholder: "https://m.me/username", urlPrefix: "https://m.me/" },
  { id: "facebook", name: "Facebook", icon: "Facebook", placeholder: "https://facebook.com/username", urlPrefix: "https://facebook.com/" },
  { id: "instagram", name: "Instagram", icon: "Instagram", placeholder: "https://instagram.com/username", urlPrefix: "https://instagram.com/" },
  { id: "tiktok", name: "TikTok", icon: "Music2", placeholder: "https://tiktok.com/@username", urlPrefix: "https://tiktok.com/@" },
  { id: "youtube", name: "YouTube", icon: "Youtube", placeholder: "https://youtube.com/@channel", urlPrefix: "https://youtube.com/@" },
  { id: "x", name: "X", icon: "Twitter", placeholder: "https://x.com/username", urlPrefix: "https://x.com/" },
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin", placeholder: "https://linkedin.com/in/username", urlPrefix: "https://linkedin.com/in/" },
  { id: "discord", name: "Discord", icon: "MessageSquareText", placeholder: "https://discord.gg/invite" },
  { id: "snapchat", name: "Snapchat", icon: "Ghost", placeholder: "https://snapchat.com/add/username" },
  { id: "pinterest", name: "Pinterest", icon: "Pin", placeholder: "https://pinterest.com/username" },
  { id: "reddit", name: "Reddit", icon: "MessageCircleMore", placeholder: "https://reddit.com/u/username" },
  { id: "email", name: "Email", icon: "Mail", placeholder: "mailto:you@example.com" },
  { id: "phone", name: "Phone", icon: "Phone", placeholder: "tel:+1234567890" },
  { id: "website", name: "Website", icon: "Globe", placeholder: "https://example.com" },
];

export const LINK_PRESETS: SocialPlatform[] = [
  { id: "website", name: "Website", icon: "Globe", placeholder: "https://example.com" },
  { id: "whatsapp", name: "WhatsApp", icon: "MessageCircle", placeholder: "" },
  { id: "telegram", name: "Telegram", icon: "Send", placeholder: "" },
  { id: "messenger", name: "Messenger", icon: "MessageSquare", placeholder: "https://m.me/username" },
  { id: "facebook", name: "Facebook", icon: "Facebook", placeholder: "https://facebook.com/username" },
  { id: "instagram", name: "Instagram", icon: "Instagram", placeholder: "https://instagram.com/username" },
  { id: "tiktok", name: "TikTok", icon: "Music2", placeholder: "https://tiktok.com/@username" },
  { id: "youtube", name: "YouTube", icon: "Youtube", placeholder: "https://youtube.com/@channel" },
  { id: "x", name: "X", icon: "Twitter", placeholder: "https://x.com/username" },
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin", placeholder: "https://linkedin.com/in/username" },
  { id: "discord", name: "Discord", icon: "MessageSquareText", placeholder: "https://discord.gg/invite" },
  { id: "email", name: "Email", icon: "Mail", placeholder: "" },
  { id: "phone", name: "Phone", icon: "Phone", placeholder: "" },
  { id: "custom", name: "Custom Link", icon: "Link2", placeholder: "https://" },
];

export function getSocialPlatform(id: string): SocialPlatform {
  return SOCIAL_PLATFORMS.find((p) => p.id === id) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1]!;
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildTelegramUrl(usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://t.me/${trimmed.replace(/^@/, "")}`;
}

export function buildMailtoUrl(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
