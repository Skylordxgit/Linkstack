"use client";

import type { AppearanceConfig, SocialLink } from "@/types";
import { getSocialPlatform } from "@/lib/socials";
import { DynamicIcon } from "@/components/dynamic-icon";
import { cn } from "@/lib/utils";

export function SocialIconsRow({
  socials,
  appearance,
  onClick,
}: {
  socials: SocialLink[];
  appearance: AppearanceConfig;
  onClick?: (social: SocialLink) => void;
}) {
  const enabled = socials.filter((s) => s.enabled);
  if (enabled.length === 0) return null;

  const size = appearance.iconSize ?? 20;
  const spacing = appearance.iconSpacing ?? 12;
  const style = appearance.iconStyle ?? "glass";
  const color = appearance.iconColor;

  return (
    <div className="flex flex-wrap items-center justify-center" style={{ gap: spacing }}>
      {enabled.map((social) => {
        const platform = getSocialPlatform(social.platform);
        return (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => onClick?.(social)}
            className={cn(
              "flex items-center justify-center rounded-full transition-transform hover:scale-110",
              style === "glass" && "glass-panel [--glass-opacity:0.14] [--glass-blur:12px]",
              style === "filled" && "bg-white/15",
              style === "outline" && "border border-white/30",
              style === "minimal" && "opacity-80 hover:opacity-100"
            )}
            style={{ width: size + 20, height: size + 20, color }}
            aria-label={platform.name}
          >
            <DynamicIcon name={platform.icon} className="shrink-0" style={{ width: size, height: size }} />
          </a>
        );
      })}
    </div>
  );
}
