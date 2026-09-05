"use client";

import { useState } from "react";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/media-picker";
import { useToast } from "@/components/ui/use-toast";
import { saveTemplate } from "@/services/admin";
import { isValidSlug, isReservedSlug, slugify } from "@/lib/slug";
import type { Page, PageStatus } from "@/types";
import type { usePageEditor } from "@/hooks/use-page-editor";

const STATUS_OPTIONS: { value: PageStatus; label: string; description: string }[] = [
  { value: "DRAFT", label: "Draft", description: "Only visible to you in the admin preview." },
  { value: "PUBLISHED", label: "Published", description: "Publicly accessible at its URL." },
  { value: "HIDDEN", label: "Hidden", description: "Accessible by direct link, excluded from sitemap." },
  { value: "ARCHIVED", label: "Archived", description: "Not publicly accessible." },
];

const STATUS_VARIANT: Record<PageStatus, "success" | "secondary" | "warning" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  HIDDEN: "warning",
  ARCHIVED: "destructive",
};

export function SettingsTab({ page, editor }: { page: Page; editor: ReturnType<typeof usePageEditor> }) {
  const [slugInput, setSlugInput] = useState(page.slug);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState(`${page.name} Template`);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const { toast } = useToast();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      await saveTemplate({ name: templateName, pageId: page.id });
      toast({ title: "Template saved" });
      setTemplateDialogOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not save template", description: err.message });
    } finally {
      setSavingTemplate(false);
    }
  };

  const commitSlug = () => {
    const next = slugify(slugInput);
    if (!isValidSlug(next)) {
      setSlugError("Lowercase letters, numbers, hyphens or underscores (2-64 chars)");
      return;
    }
    if (isReservedSlug(next)) {
      setSlugError("This slug is reserved");
      return;
    }
    setSlugError(null);
    setSlugInput(next);
    if (next !== page.slug) editor.updateField("slug", next);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => editor.updateField("status", opt.value)}
              className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors ${
                page.status === opt.value ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{opt.label}</span>
                {page.status === opt.value && <Badge variant={STATUS_VARIANT[opt.value]}>Current</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URL</CardTitle>
          <CardDescription>Changing this changes the public link. Old links will stop working.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">{siteUrl}/</span>
            <Input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} onBlur={commitSlug} />
          </div>
          {slugError && <p className="text-xs text-red-400">{slugError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal name</CardTitle>
          <CardDescription>Only visible to you in the admin — not shown publicly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input value={page.name} onChange={(e) => editor.updateField("name", e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label>Show footer</Label>
            <Switch checked={page.footerEnabled} onCheckedChange={(v) => editor.updateField("footerEnabled", v)} />
          </div>
          {page.footerEnabled && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>Custom text</Label>
                <Textarea value={page.footerText ?? ""} onChange={(e) => editor.updateField("footerText", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Custom logo</Label>
                <MediaPicker usage="general" value={page.footerLogo ?? ""} onChange={(url) => editor.updateField("footerLogo", url)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Save this page's structure and style as a reusable starting point.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
            <LayoutTemplate className="h-4 w-4" /> Save as Template
          </Button>
        </CardContent>
      </Card>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
            <DialogDescription>Creates a reusable snapshot of this page's blocks, socials and styling.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Template name</Label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
              {savingTemplate && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
