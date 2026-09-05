"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Copy, Loader2, ImageIcon, FileVideo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { listMedia, uploadMedia, deleteMedia } from "@/services/admin";
import type { Media } from "@/types";
import { formatDate } from "@/lib/utils";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const items = await listMedia(kind === "all" ? undefined : kind);
      setMedia(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, "general");
      }
      toast({ title: "Upload complete" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyUrl = async (item: Media) => {
    const full = `${window.location.origin}${item.url}`;
    await navigator.clipboard.writeText(full);
    toast({ title: "URL copied" });
  };

  const handleDelete = async (item: Media) => {
    const ok = await confirm({
      title: "Delete media?",
      description: `"${item.filename}" will be permanently removed. Pages using it will show a broken image until updated.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await deleteMedia(item.id);
    toast({ title: "Media deleted" });
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">{media.length} file(s)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </Button>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No media uploaded yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden">
              <div className="flex aspect-square items-center justify-center bg-white/5">
                {item.kind === "video" ? (
                  <FileVideo className="h-8 w-8 text-muted-foreground" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="sm" variant="outline" onClick={() => copyUrl(item)}>
                  <Copy className="h-3.5 w-3.5" /> Copy URL
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
              <div className="p-2 text-center text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</div>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
