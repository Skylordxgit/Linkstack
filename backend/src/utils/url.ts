const BLOCKED_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/** Validates a URL is http(s) or a safe non-http scheme we explicitly allow (mailto/tel), rejecting dangerous protocols. */
export function isSafeUrl(raw: string): boolean {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (BLOCKED_PROTOCOLS.some((p) => lower.startsWith(p))) return false;

  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildTelegramUrl(usernameOrUrl: string): string {
  const trimmed = usernameOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  const username = trimmed.replace(/^@/, "");
  return `https://t.me/${username}`;
}

export function buildMailtoUrl(email: string, subject?: string): string {
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
