"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicIcon } from "@/components/dynamic-icon";
import { SOCIAL_PLATFORMS, getSocialPlatform } from "@/lib/socials";
import { ICON_STYLES } from "@/lib/themes";
import type { Page, SocialLink } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

function SocialRow({
  social,
  onPatch,
  onRemove,
}: {
  social: SocialLink;
  onPatch: (patch: Partial<SocialLink>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: social.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const platform = getSocialPlatform(social.platform);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl bg-white/5 p-2 ${isDragging ? "opacity-60" : ""}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none rounded-lg p-1.5 text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <Select value={social.platform} onValueChange={(v) => onPatch({ platform: v })}>
        <SelectTrigger className="w-40 shrink-0">
          <SelectValue>
            <span className="flex items-center gap-2">
              <DynamicIcon name={platform.icon} className="h-4 w-4" /> {platform.name}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SOCIAL_PLATFORMS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <DynamicIcon name={p.icon} className="h-4 w-4" /> {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder={platform.placeholder}
        value={social.url}
        onChange={(e) => onPatch({ url: e.target.value })}
        className="flex-1"
      />
      <Switch checked={social.enabled} onCheckedChange={(v) => onPatch({ enabled: v })} />
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
    </div>
  );
}

export function SocialTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  const socials = [...(page.socialLinks ?? [])].sort((a, b) => a.position - b.position);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const appearance = page.appearanceConfig;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = socials.findIndex((s) => s.id === active.id);
    const newIndex = socials.findIndex((s) => s.id === over.id);
    editor.socials.reorder(arrayMove(socials, oldIndex, newIndex).map((s) => s.id));
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Social links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {socials.length === 0 && (
            <p className="text-sm text-muted-foreground">No social links yet. Add one below.</p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={socials.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {socials.map((s) => (
                  <SocialRow
                    key={s.id}
                    social={s}
                    onPatch={(patch) => editor.socials.patch(s.id, patch)}
                    onRemove={() => editor.socials.remove(s.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button
            variant="outline"
            className="border-dashed"
            onClick={() => editor.socials.add({ platform: "instagram", url: "", enabled: true })}
          >
            <Plus className="h-4 w-4" /> Add Social Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Icon style</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Style</Label>
            <Select
              value={(appearance.iconStyle as string) || "glass"}
              onValueChange={(v) => editor.updateAppearance({ iconStyle: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_STYLES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Size ({(appearance.iconSize as number) ?? 20}px)</Label>
            <Slider
              min={14}
              max={36}
              value={[(appearance.iconSize as number) ?? 20]}
              onValueChange={([v]) => editor.updateAppearance({ iconSize: v })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Spacing ({(appearance.iconSpacing as number) ?? 12}px)</Label>
            <Slider
              min={0}
              max={32}
              value={[(appearance.iconSpacing as number) ?? 12]}
              onValueChange={([v]) => editor.updateAppearance({ iconSpacing: v })}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label>Color</Label>
            <input
              type="color"
              value={(appearance.iconColor as string) || "#ffffff"}
              onChange={(e) => editor.updateAppearance({ iconColor: e.target.value })}
              className="h-9 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
