"use client";

import type { AppearanceConfig, Block } from "@/types";
import { DynamicIcon } from "@/components/dynamic-icon";
import { buttonStyleClass, animationClass } from "@/lib/render-helpers";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

function goLinkHref(blockId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "/api";
  return `${base}/go/${blockId}`;
}

export function BlockRenderer({
  block,
  appearance,
  mode,
}: {
  block: Block;
  appearance: AppearanceConfig;
  mode: "public" | "preview";
}) {
  if (!block.enabled) return null;

  const radius = appearance.buttonRadius ?? 16;
  const height = appearance.buttonHeight ?? 52;
  const commonStyle = { borderRadius: radius, minHeight: height };

  switch (block.type) {
    case "LINK": {
      const href = mode === "public" ? goLinkHref(block.id) : "#";
      return (
        <a
          href={href}
          target={mode === "public" ? "_blank" : undefined}
          rel="noreferrer"
          onClick={(e) => {
            if (mode === "preview") e.preventDefault();
          }}
          style={commonStyle}
          className={cn(
            "group flex w-full items-center gap-3 px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5",
            buttonStyleClass(appearance.buttonStyle),
            animationClass(block.animation),
            block.featured && "ring-2 ring-primary/60"
          )}
        >
          {block.icon && <DynamicIcon name={block.icon} className="h-5 w-5 shrink-0" />}
          {block.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.thumbnail} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
          )}
          <span className="min-w-0 flex-1 truncate text-left">{block.title || "Untitled link"}</span>
          {block.featured && <Star className="h-4 w-4 shrink-0 text-amber-400" />}
        </a>
      );
    }

    case "HEADING":
      return <h2 className="w-full px-1 text-center text-lg font-semibold">{block.title}</h2>;

    case "TEXT":
      return <p className="w-full px-1 text-center text-sm opacity-90">{block.description}</p>;

    case "DIVIDER":
      return <div className="my-1 h-px w-full bg-white/15" />;

    case "SPACER":
      return <div style={{ height: (block.config?.height as number) || 16 }} />;

    case "IMAGE":
      return block.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.thumbnail} alt={block.title || ""} className="w-full rounded-2xl object-cover" />
      ) : null;

    case "VIDEO":
      return block.url ? (
        <video controls className="w-full rounded-2xl" src={block.url} poster={block.thumbnail || undefined} />
      ) : null;

    case "CONTACT": {
      const href = mode === "public" ? goLinkHref(block.id) : "#";
      return (
        <a
          href={href}
          onClick={(e) => {
            if (mode === "preview") e.preventDefault();
          }}
          style={commonStyle}
          className={cn(
            "flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-medium",
            buttonStyleClass(appearance.buttonStyle),
            animationClass(block.animation)
          )}
        >
          {block.icon && <DynamicIcon name={block.icon} className="h-5 w-5" />}
          {block.title}
        </a>
      );
    }

    case "SOCIAL_ICONS":
      return null; // rendered separately via SocialIconsRow

    default:
      return null;
  }
}
