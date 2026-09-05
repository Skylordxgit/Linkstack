import type { AppearanceConfig, BackgroundConfig } from "@/types";
import { getGlassPreset } from "@/lib/themes";
import type { CSSProperties } from "react";

export function glassCssVars(appearance: AppearanceConfig): CSSProperties {
  const preset = getGlassPreset(appearance.glassPreset);
  const opacity = appearance.glassOpacity ?? preset.opacity;
  const blur = appearance.glassBlur ?? preset.blur;
  const borderOpacity = appearance.glassBorderOpacity ?? preset.borderOpacity;
  const borderWidth = appearance.glassBorderWidth ?? preset.borderWidth;
  const shadow = appearance.glassShadow ?? preset.shadow;
  const brightness = appearance.glassBrightness ?? preset.brightness;
  const saturation = appearance.glassSaturation ?? preset.saturation;
  const tint = appearance.glassTint ?? preset.tint;

  return {
    ["--glass-opacity" as string]: opacity,
    ["--glass-blur" as string]: `${blur}px`,
    ["--glass-border-opacity" as string]: borderOpacity,
    ["--glass-border-width" as string]: `${borderWidth}px`,
    ["--glass-shadow" as string]: shadow,
    ["--glass-brightness" as string]: brightness,
    ["--glass-saturation" as string]: saturation,
    ["--glass-tint" as string]: tint,
  } as CSSProperties;
}

export function backgroundStyle(bg: BackgroundConfig): { className: string; style: CSSProperties } {
  const colors = bg.colors && bg.colors.length > 0 ? bg.colors : ["#0ea5e9", "#8b5cf6", "#22d3ee"];
  const angle = bg.angle ?? 135;

  switch (bg.type) {
    case "aurora":
      return {
        className: "bg-aurora",
        style: { ["--c1" as string]: colors[0], ["--c2" as string]: colors[1] ?? colors[0], ["--c3" as string]: colors[2] ?? colors[0] } as CSSProperties,
      };
    case "mesh-gradient":
      return {
        className: "bg-mesh",
        style: { ["--c1" as string]: colors[0], ["--c2" as string]: colors[1] ?? colors[0], ["--c3" as string]: colors[2] ?? colors[0] } as CSSProperties,
      };
    case "animated-gradient":
      return {
        className: "bg-animated-gradient",
        style: { ["--c1" as string]: colors[0], ["--c2" as string]: colors[1] ?? colors[0] } as CSSProperties,
      };
    case "radial-gradient":
      return {
        className: "",
        style: { background: `radial-gradient(circle at 50% 20%, ${colors.join(", ")})` },
      };
    case "linear-gradient":
      return {
        className: "",
        style: { background: `linear-gradient(${angle}deg, ${colors.join(", ")})` },
      };
    case "image":
      return {
        className: "bg-cover bg-center",
        style: {
          backgroundImage: bg.imageUrl ? `url(${bg.imageUrl})` : undefined,
          backgroundPosition: bg.imagePosition || "center",
          backgroundSize: bg.imageSize || "cover",
          filter: `blur(${bg.imageBlur ?? 0}px) brightness(${bg.imageBrightness ?? 1})`,
        },
      };
    case "video":
    case "blobs":
    case "particles":
      return { className: "", style: { background: colors[0] ?? "#0a0a0a" } };
    case "solid":
    default:
      return { className: "", style: { background: colors[0] ?? "#0a0a0a" } };
  }
}

export function buttonStyleClass(style?: string): string {
  switch (style) {
    case "glass-glow":
      return "glass-panel glass-glow text-current";
    case "gradient":
      return "bg-gradient-to-r from-[var(--btn-c1,#8b5cf6)] to-[var(--btn-c2,#0ea5e9)] text-white shadow-lg";
    case "solid":
      return "bg-white text-black shadow";
    case "outline":
      return "border-2 bg-transparent";
    case "minimal":
      return "bg-transparent hover:bg-white/5";
    case "neon":
      return "glass-panel border-2 text-current shadow-[0_0_18px_var(--glow-color,#a855f7)]";
    case "glass":
    default:
      return "glass-panel text-current";
  }
}

export function animationClass(animation?: string): string {
  switch (animation) {
    case "float":
      return "anim-float";
    case "pulse":
      return "anim-pulse";
    case "glow":
      return "anim-glow";
    case "scale":
      return "anim-scale";
    case "shimmer":
      return "anim-shimmer relative";
    case "bounce":
      return "anim-bounce";
    case "tilt":
      return "anim-tilt";
    default:
      return "";
  }
}
