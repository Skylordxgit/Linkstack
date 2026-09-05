"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePageEditor } from "@/hooks/use-page-editor";
import { EditorHeader } from "@/components/editor/editor-header";
import { MobilePreview } from "@/components/editor/mobile-preview";
import { ContentTab } from "@/components/editor/content-tab";
import { SocialTab } from "@/components/editor/social-tab";
import { AppearanceTab } from "@/components/editor/appearance-tab";
import { BackgroundTab } from "@/components/editor/background-tab";
import { SeoTab } from "@/components/editor/seo-tab";
import { SettingsTab } from "@/components/editor/settings-tab";
import { AnalyticsTab } from "@/components/editor/analytics-tab";
import { setPageStatus } from "@/services/pages";
import { useToast } from "@/components/ui/use-toast";

export default function PageEditorPage() {
  const params = useParams<{ id: string }>();
  const editor = usePageEditor(params.id);
  const { toast } = useToast();

  if (editor.loading || !editor.page) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const page = editor.page;

  const togglePublish = async () => {
    try {
      const updated = await setPageStatus(page.id, page.status === "PUBLISHED" ? "unpublish" : "publish");
      editor.updateField("status", updated.status);
      toast({ title: updated.status === "PUBLISHED" ? "Page published" : "Page unpublished" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EditorHeader page={page} saveStatus={editor.saveStatus} onSaveNow={editor.saveNow} onTogglePublish={togglePublish} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Tabs defaultValue="content">
            <TabsList className="flex-wrap">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <ContentTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="social">
              <SocialTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="background">
              <BackgroundTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab page={page} editor={editor} />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab page={page} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <MobilePreview page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
