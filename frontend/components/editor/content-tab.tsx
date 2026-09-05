"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MediaPicker } from "@/components/admin/media-picker";
import { BlockList } from "@/components/editor/block-list";
import { AddBlockMenu } from "@/components/editor/add-block-menu";
import type { Page, BlockType } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

export function ContentTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Profile image</Label>
            <MediaPicker usage="avatar" value={page.avatarUrl ?? ""} onChange={(url) => editor.updateField("avatarUrl", url)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Page title</Label>
            <Input value={page.title} onChange={(e) => editor.updateField("title", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Subtitle</Label>
            <Input value={page.subtitle ?? ""} onChange={(e) => editor.updateField("subtitle", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Bio</Label>
            <Textarea value={page.bio ?? ""} onChange={(e) => editor.updateField("bio", e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <Input value={page.location ?? ""} onChange={(e) => editor.updateField("location", e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Verified badge</Label>
            <Switch checked={page.verified} onCheckedChange={(v) => editor.updateField("verified", v)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Profile shape</Label>
              <Select value={page.profileShape} onValueChange={(v) => editor.updateField("profileShape", v as Page["profileShape"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIRCLE">Circle</SelectItem>
                  <SelectItem value="ROUNDED">Rounded</SelectItem>
                  <SelectItem value="SQUARE">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Profile size ({page.profileSize}px)</Label>
              <Slider
                min={48}
                max={160}
                step={4}
                value={[page.profileSize]}
                onValueChange={([v]) => editor.updateField("profileSize", v)}
                className="mt-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <BlockList
            blocks={page.blocks ?? []}
            onReorder={editor.blocks.reorder}
            onPatch={editor.blocks.patch}
            onRemove={editor.blocks.remove}
            onDuplicate={editor.blocks.duplicate}
          />
          <AddBlockMenu onAdd={(type: BlockType) => editor.blocks.add({ type, enabled: true })} />
        </CardContent>
      </Card>
    </div>
  );
}
