"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaPicker } from "@/components/admin/media-picker";
import type { Page } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

export function SeoTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Search &amp; social preview</CardTitle>
          <CardDescription>Controls how this page appears in search results and when shared.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>SEO Title</Label>
            <Input value={page.seoTitle ?? ""} onChange={(e) => editor.updateField("seoTitle", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>SEO Description</Label>
            <Textarea value={page.seoDescription ?? ""} onChange={(e) => editor.updateField("seoDescription", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Canonical URL</Label>
            <Input value={page.canonicalUrl ?? ""} onChange={(e) => editor.updateField("canonicalUrl", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>OpenGraph Title</Label>
            <Input value={page.ogTitle ?? ""} onChange={(e) => editor.updateField("ogTitle", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>OpenGraph Description</Label>
            <Textarea value={page.ogDescription ?? ""} onChange={(e) => editor.updateField("ogDescription", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>OpenGraph Image</Label>
            <MediaPicker usage="seo" value={page.seoImage ?? ""} onChange={(url) => editor.updateField("seoImage", url)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Twitter card type</Label>
            <Select value={page.twitterCard ?? "summary_large_image"} onValueChange={(v) => editor.updateField("twitterCard", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Indexable</Label>
              <p className="text-xs text-muted-foreground">Include this page in the sitemap and allow search engines to index it.</p>
            </div>
            <Switch checked={page.indexable} onCheckedChange={(v) => editor.updateField("indexable", v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
