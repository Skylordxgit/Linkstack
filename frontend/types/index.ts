export type PageStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
export type ProfileShape = "CIRCLE" | "ROUNDED" | "SQUARE";
export type BlockType =
  | "LINK"
  | "HEADING"
  | "TEXT"
  | "DIVIDER"
  | "SPACER"
  | "IMAGE"
  | "VIDEO"
  | "CONTACT"
  | "SOCIAL_ICONS";

export interface AppearanceConfig {
  buttonStyle?: string;
  buttonAnimation?: string;
  buttonRadius?: number;
  buttonHeight?: number;
  buttonShadow?: boolean;
  glassPreset?: string;
  glassOpacity?: number;
  glassBlur?: number;
  glassBorderOpacity?: number;
  glassBorderWidth?: number;
  glassShadow?: number;
  glassGlow?: boolean;
  glassBrightness?: number;
  glassSaturation?: number;
  glassTint?: string;
  fontFamily?: string;
  textColor?: string;
  iconStyle?: "glass" | "filled" | "outline" | "minimal";
  iconSize?: number;
  iconSpacing?: number;
  iconColor?: string;
  [key: string]: unknown;
}

export interface BackgroundConfig {
  type?:
    | "solid"
    | "linear-gradient"
    | "radial-gradient"
    | "animated-gradient"
    | "mesh-gradient"
    | "image"
    | "video"
    | "aurora"
    | "blobs"
    | "particles";
  colors?: string[];
  angle?: number;
  imageUrl?: string;
  imagePosition?: string;
  imageSize?: string;
  imageBlur?: number;
  imageBrightness?: number;
  overlayOpacity?: number;
  videoUrl?: string;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  videoFallbackImage?: string;
  [key: string]: unknown;
}

export interface Block {
  id: string;
  pageId: string;
  type: BlockType;
  title?: string | null;
  url?: string | null;
  description?: string | null;
  icon?: string | null;
  thumbnail?: string | null;
  position: number;
  enabled: boolean;
  featured: boolean;
  animation: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  pageId: string;
  platform: string;
  url: string;
  position: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  verified: boolean;
  profileShape: ProfileShape;
  profileSize: number;

  status: PageStatus;
  indexable: boolean;

  theme: string;
  appearanceConfig: AppearanceConfig;
  backgroundConfig: BackgroundConfig;

  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterCard?: string | null;

  footerEnabled: boolean;
  footerText?: string | null;
  footerLogo?: string | null;

  templateSource?: string | null;

  createdAt: string;
  updatedAt: string;

  blocks?: Block[];
  socialLinks?: SocialLink[];

  views?: number;
  clicks?: number;
  ctr?: number;
  blockCount?: number;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  kind: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  target?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalPages: number;
  publishedPages: number;
  totalViews: number;
  totalClicks: number;
  ctr: number;
  mostViewedPage: { id: string; name: string; slug: string; views: number } | null;
  mostClickedLink: { id: string; title: string | null; pageId: string; clicks: number } | null;
  recentPages: Page[];
  recentActivity: AuditLogEntry[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
