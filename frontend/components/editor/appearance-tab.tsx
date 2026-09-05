"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THEMES, GLASS_PRESETS, BUTTON_STYLES, BUTTON_ANIMATIONS, getGlassPreset } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { Page } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

export function AppearanceTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  const appearance = page.appearanceConfig;
  const glassPresetId = (appearance.glassPreset as string) || "soft-glass";
  const preset = getGlassPreset(glassPresetId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Pick a starting preset — everything below stays fully editable.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => editor.applyTheme(theme.id, theme.background as any, theme.appearance as any)}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:border-primary/60",
                  page.theme === theme.id ? "border-primary bg-primary/10" : "border-white/10"
                )}
              >
                <div
                  className="h-12 w-full rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${theme.swatch.join(", ")})` }}
                />
                <span className="text-xs font-medium">{theme.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Glass UI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {GLASS_PRESETS.map((g) => (
              <button
                key={g.id}
                onClick={() => editor.updateAppearance({ glassPreset: g.id })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  glassPresetId === g.id ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"
                )}
              >
                {g.name}
              </button>
            ))}
          </div>

          <SliderField
            label="Opacity"
            value={(appearance.glassOpacity as number) ?? preset.opacity}
            min={0}
            max={0.8}
            step={0.02}
            onChange={(v) => editor.updateAppearance({ glassOpacity: v })}
          />
          <SliderField
            label="Backdrop blur"
            value={(appearance.glassBlur as number) ?? preset.blur}
            min={0}
            max={40}
            step={1}
            unit="px"
            onChange={(v) => editor.updateAppearance({ glassBlur: v })}
          />
          <SliderField
            label="Border opacity"
            value={(appearance.glassBorderOpacity as number) ?? preset.borderOpacity}
            min={0}
            max={1}
            step={0.02}
            onChange={(v) => editor.updateAppearance({ glassBorderOpacity: v })}
          />
          <SliderField
            label="Border width"
            value={(appearance.glassBorderWidth as number) ?? preset.borderWidth}
            min={0}
            max={4}
            step={0.5}
            unit="px"
            onChange={(v) => editor.updateAppearance({ glassBorderWidth: v })}
          />
          <SliderField
            label="Shadow"
            value={(appearance.glassShadow as number) ?? preset.shadow}
            min={0}
            max={1}
            step={0.02}
            onChange={(v) => editor.updateAppearance({ glassShadow: v })}
          />
          <SliderField
            label="Brightness"
            value={(appearance.glassBrightness as number) ?? preset.brightness}
            min={0.5}
            max={1.5}
            step={0.02}
            onChange={(v) => editor.updateAppearance({ glassBrightness: v })}
          />
          <SliderField
            label="Saturation"
            value={(appearance.glassSaturation as number) ?? preset.saturation}
            min={0}
            max={2}
            step={0.05}
            onChange={(v) => editor.updateAppearance({ glassSaturation: v })}
          />
          <div className="flex items-center justify-between gap-4">
            <Label>Tint color</Label>
            <input
              type="color"
              value={(appearance.glassTint as string) || preset.tint}
              onChange={(e) => editor.updateAppearance({ glassTint: e.target.value })}
              className="h-9 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Glow</Label>
            <Switch
              checked={(appearance.glassGlow as boolean) ?? preset.glow}
              onCheckedChange={(v) => editor.updateAppearance({ glassGlow: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Style</Label>
            <Select value={(appearance.buttonStyle as string) || "glass"} onValueChange={(v) => editor.updateAppearance({ buttonStyle: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUTTON_STYLES.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Default animation</Label>
            <Select
              value={(appearance.buttonAnimation as string) || "none"}
              onValueChange={(v) => editor.updateAppearance({ buttonAnimation: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUTTON_ANIMATIONS.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Individual links can override this in the Content tab.</p>
          </div>

          <SliderField
            label="Radius"
            value={(appearance.buttonRadius as number) ?? 16}
            min={0}
            max={32}
            step={1}
            unit="px"
            onChange={(v) => editor.updateAppearance({ buttonRadius: v })}
          />
          <SliderField
            label="Height"
            value={(appearance.buttonHeight as number) ?? 52}
            min={40}
            max={72}
            step={2}
            unit="px"
            onChange={(v) => editor.updateAppearance({ buttonHeight: v })}
          />
          <div className="flex items-center justify-between">
            <Label>Shadow</Label>
            <Switch
              checked={(appearance.buttonShadow as boolean) ?? true}
              onCheckedChange={(v) => editor.updateAppearance({ buttonShadow: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label>Text color</Label>
          <input
            type="color"
            value={(appearance.textColor as string) || "#f8fafc"}
            onChange={(e) => editor.updateAppearance({ textColor: e.target.value })}
            className="h-9 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {unit}
        </span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
