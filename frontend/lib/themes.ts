import type { AppearanceConfig, BackgroundConfig } from "@/types";

export interface GlassPreset {
  id: string;
  name: string;
  opacity: number;
  blur: number;
  borderOpacity: number;
  borderWidth: number;
  shadow: number;
  glow: boolean;
  brightness: number;
  saturation: number;
  tint: string;
}

export const GLASS_PRESETS: GlassPreset[] = [
  { id: "soft-glass", name: "Soft Glass", opacity: 0.14, blur: 16, borderOpacity: 0.18, borderWidth: 1, shadow: 0.2, glow: false, brightness: 1, saturation: 1.1, tint: "#ffffff" },
  { id: "crystal-glass", name: "Crystal Glass", opacity: 0.08, blur: 24, borderOpacity: 0.28, borderWidth: 1, shadow: 0.15, glow: false, brightness: 1.05, saturation: 1.2, tint: "#e0f2fe" },
  { id: "dark-glass", name: "Dark Glass", opacity: 0.35, blur: 18, borderOpacity: 0.12, borderWidth: 1, shadow: 0.4, glow: false, brightness: 0.9, saturation: 1, tint: "#000000" },
  { id: "premium-glass", name: "Premium Glass", opacity: 0.18, blur: 22, borderOpacity: 0.35, borderWidth: 1.5, shadow: 0.35, glow: true, brightness: 1.05, saturation: 1.25, tint: "#fef3c7" },
  { id: "neon-glass", name: "Neon Glass", opacity: 0.16, blur: 14, borderOpacity: 0.5, borderWidth: 1.5, shadow: 0.5, glow: true, brightness: 1.1, saturation: 1.5, tint: "#a855f7" },
  { id: "frosted-glass", name: "Frosted Glass", opacity: 0.45, blur: 28, borderOpacity: 0.2, borderWidth: 1, shadow: 0.15, glow: false, brightness: 1.1, saturation: 0.9, tint: "#ffffff" },
  { id: "aurora-glass", name: "Aurora Glass", opacity: 0.2, blur: 20, borderOpacity: 0.3, borderWidth: 1, shadow: 0.3, glow: true, brightness: 1.05, saturation: 1.3, tint: "#67e8f9" },
];

export function getGlassPreset(id?: string): GlassPreset {
  return GLASS_PRESETS.find((g) => g.id === id) ?? GLASS_PRESETS[0]!;
}

export interface Theme {
  id: string;
  name: string;
  background: BackgroundConfig;
  appearance: AppearanceConfig;
  textColor: string;
  swatch: string[];
}

export const THEMES: Theme[] = [
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    background: { type: "aurora", colors: ["#0ea5e9", "#8b5cf6", "#22d3ee"] },
    appearance: { glassPreset: "aurora-glass", buttonStyle: "glass-glow", iconStyle: "glass" },
    textColor: "#f8fafc",
    swatch: ["#0ea5e9", "#8b5cf6", "#22d3ee"],
  },
  {
    id: "midnight-glass",
    name: "Midnight Glass",
    background: { type: "linear-gradient", colors: ["#0f172a", "#1e293b"], angle: 160 },
    appearance: { glassPreset: "dark-glass", buttonStyle: "glass", iconStyle: "outline" },
    textColor: "#e2e8f0",
    swatch: ["#0f172a", "#1e293b", "#334155"],
  },
  {
    id: "purple-dream",
    name: "Purple Dream",
    background: { type: "linear-gradient", colors: ["#7c3aed", "#c026d3"], angle: 135 },
    appearance: { glassPreset: "premium-glass", buttonStyle: "gradient", iconStyle: "glass" },
    textColor: "#faf5ff",
    swatch: ["#7c3aed", "#c026d3", "#a855f7"],
  },
  {
    id: "ocean-glass",
    name: "Ocean Glass",
    background: { type: "linear-gradient", colors: ["#0369a1", "#0891b2"], angle: 145 },
    appearance: { glassPreset: "crystal-glass", buttonStyle: "glass", iconStyle: "glass" },
    textColor: "#f0f9ff",
    swatch: ["#0369a1", "#0891b2", "#22d3ee"],
  },
  {
    id: "cyber",
    name: "Cyber",
    background: { type: "mesh-gradient", colors: ["#020617", "#4c1d95", "#db2777"] },
    appearance: { glassPreset: "neon-glass", buttonStyle: "neon", buttonAnimation: "glow", iconStyle: "outline" },
    textColor: "#f5f3ff",
    swatch: ["#020617", "#4c1d95", "#db2777"],
  },
  {
    id: "emerald",
    name: "Emerald",
    background: { type: "linear-gradient", colors: ["#065f46", "#059669"], angle: 150 },
    appearance: { glassPreset: "soft-glass", buttonStyle: "solid", iconStyle: "filled" },
    textColor: "#ecfdf5",
    swatch: ["#065f46", "#059669", "#34d399"],
  },
  {
    id: "sunset",
    name: "Sunset",
    background: { type: "linear-gradient", colors: ["#c2410c", "#db2777"], angle: 135 },
    appearance: { glassPreset: "premium-glass", buttonStyle: "gradient", iconStyle: "glass" },
    textColor: "#fff7ed",
    swatch: ["#c2410c", "#db2777", "#f59e0b"],
  },
  {
    id: "crystal",
    name: "Crystal",
    background: { type: "linear-gradient", colors: ["#e0e7ff", "#c7d2fe"], angle: 160 },
    appearance: { glassPreset: "crystal-glass", buttonStyle: "outline", iconStyle: "minimal" },
    textColor: "#1e1b4b",
    swatch: ["#e0e7ff", "#c7d2fe", "#a5b4fc"],
  },
  {
    id: "dark-neon",
    name: "Dark Neon",
    background: { type: "radial-gradient", colors: ["#09090b", "#18181b"] },
    appearance: { glassPreset: "neon-glass", buttonStyle: "neon", buttonAnimation: "pulse", iconStyle: "outline" },
    textColor: "#fafafa",
    swatch: ["#09090b", "#18181b", "#a855f7"],
  },
  {
    id: "minimal-light",
    name: "Minimal Light",
    background: { type: "solid", colors: ["#fafafa"] },
    appearance: { glassPreset: "soft-glass", buttonStyle: "minimal", iconStyle: "minimal" },
    textColor: "#18181b",
    swatch: ["#fafafa", "#e4e4e7", "#a1a1aa"],
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    background: { type: "solid", colors: ["#0a0a0a"] },
    appearance: { glassPreset: "dark-glass", buttonStyle: "minimal", iconStyle: "minimal" },
    textColor: "#fafafa",
    swatch: ["#0a0a0a", "#27272a", "#71717a"],
  },
  {
    id: "galaxy",
    name: "Galaxy",
    background: { type: "mesh-gradient", colors: ["#0f0524", "#1e1b4b", "#312e81"] },
    appearance: { glassPreset: "aurora-glass", buttonStyle: "glass-glow", buttonAnimation: "shimmer", iconStyle: "glass" },
    textColor: "#ede9fe",
    swatch: ["#0f0524", "#1e1b4b", "#312e81"],
  },
];

export function getTheme(id?: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!;
}

export const BUTTON_STYLES = [
  { id: "glass", name: "Glass" },
  { id: "glass-glow", name: "Glass Glow" },
  { id: "gradient", name: "Gradient" },
  { id: "solid", name: "Solid" },
  { id: "outline", name: "Outline" },
  { id: "minimal", name: "Minimal" },
  { id: "neon", name: "Neon" },
] as const;

export const BUTTON_ANIMATIONS = [
  { id: "none", name: "None" },
  { id: "float", name: "Float" },
  { id: "pulse", name: "Pulse" },
  { id: "glow", name: "Glow" },
  { id: "scale", name: "Scale" },
  { id: "shimmer", name: "Shimmer" },
  { id: "bounce", name: "Bounce" },
  { id: "tilt", name: "Tilt" },
] as const;

export const BACKGROUND_TYPES = [
  { id: "solid", name: "Solid Color" },
  { id: "linear-gradient", name: "Linear Gradient" },
  { id: "radial-gradient", name: "Radial Gradient" },
  { id: "animated-gradient", name: "Animated Gradient" },
  { id: "mesh-gradient", name: "Mesh Gradient" },
  { id: "image", name: "Background Image" },
  { id: "video", name: "Background Video" },
  { id: "aurora", name: "Aurora" },
  { id: "blobs", name: "Floating Blobs" },
  { id: "particles", name: "Particles" },
] as const;

export const ICON_STYLES = ["glass", "filled", "outline", "minimal"] as const;
