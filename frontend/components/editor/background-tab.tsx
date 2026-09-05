"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MediaPicker } from "@/components/admin/media-picker";
import { BACKGROUND_TYPES } from "@/lib/themes";
import type { Page } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

const MULTI_COLOR_TYPES = new Set(["aurora", "mesh-gradient", "animated-gradient"]);
const TWO_COLOR_TYPES = new Set(["linear-gradient", "radial-gradient"]);

export function BackgroundTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  const bg = page.backgroundConfig;
  const type = bg.type || "aurora";
  const colors = bg.colors && bg.colors.length > 0 ? bg.colors : ["#0ea5e9", "#8b5cf6", "#22d3ee"];

  const setColor = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    editor.updateBackground({ colors: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Background type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select value={type} onValueChange={(v) => editor.updateBackground({ type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKGROUND_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(type === "solid" || TWO_COLOR_TYPES.has(type) || MULTI_COLOR_TYPES.has(type)) && (
            <div className="flex flex-col gap-1.5">
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2">
                {(type === "solid" ? [colors[0]] : MULTI_COLOR_TYPES.has(type) ? colors.slice(0, 3) : colors.slice(0, 2)).map(
                  (c, i) => (
                    <input
                      key={i}
                      type="color"
                      value={c || "#000000"}
                      onChange={(e) => setColor(i, e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-transparent"
                    />
                  )
                )}
              </div>
            </div>
          )}

          {type === "linear-gradient" && (
            <div className="flex flex-col gap-1.5">
              <Label>Angle ({bg.angle ?? 135}°)</Label>
              <Slider
                min={0}
                max={360}
                value={[bg.angle ?? 135]}
                onValueChange={([v]) => editor.updateBackground({ angle: v })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {type === "image" && (
        <Card>
          <CardHeader>
            <CardTitle>Background image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <MediaPicker
              usage="background"
              value={bg.imageUrl || ""}
              onChange={(url) => editor.updateBackground({ imageUrl: url })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Position</Label>
                <Input value={bg.imagePosition || "center"} onChange={(e) => editor.updateBackground({ imagePosition: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Size</Label>
                <Select value={bg.imageSize || "cover"} onValueChange={(v) => editor.updateBackground({ imageSize: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Blur ({bg.imageBlur ?? 0}px)</Label>
              <Slider min={0} max={30} value={[bg.imageBlur ?? 0]} onValueChange={([v]) => editor.updateBackground({ imageBlur: v })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Brightness ({bg.imageBrightness ?? 1})</Label>
              <Slider
                min={0.3}
                max={1.5}
                step={0.05}
                value={[bg.imageBrightness ?? 1]}
                onValueChange={([v]) => editor.updateBackground({ imageBrightness: v })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Overlay opacity ({bg.overlayOpacity ?? 0})</Label>
              <Slider
                min={0}
                max={0.9}
                step={0.05}
                value={[bg.overlayOpacity ?? 0]}
                onValueChange={([v]) => editor.updateBackground({ overlayOpacity: v })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === "video" && (
        <Card>
          <CardHeader>
            <CardTitle>Background video</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Video file (MP4/WebM)</Label>
              <MediaPicker usage="video" value={bg.videoUrl || ""} onChange={(url) => editor.updateBackground({ videoUrl: url })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Fallback image (mobile)</Label>
              <MediaPicker
                usage="background"
                value={bg.videoFallbackImage || ""}
                onChange={(url) => editor.updateBackground({ videoFallbackImage: url })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Overlay opacity ({bg.overlayOpacity ?? 0.3})</Label>
              <Slider
                min={0}
                max={0.9}
                step={0.05}
                value={[bg.overlayOpacity ?? 0.3]}
                onValueChange={([v]) => editor.updateBackground({ overlayOpacity: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Autoplay</Label>
              <Switch
                checked={bg.videoAutoplay !== false}
                onCheckedChange={(v) => editor.updateBackground({ videoAutoplay: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Muted</Label>
              <Switch
                checked={bg.videoMuted !== false}
                onCheckedChange={(v) => editor.updateBackground({ videoMuted: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Loop</Label>
              <Switch
                checked={bg.videoLoop !== false}
                onCheckedChange={(v) => editor.updateBackground({ videoLoop: v })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
