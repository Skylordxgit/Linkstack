"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/services/admin";
import { useToast } from "@/components/ui/use-toast";

export function MediaPicker({
  value,
  onChange,
  usage,
}: {
  value: string;
  onChange: (url: string) => void;
  usage: "avatar" | "background" | "thumbnail" | "seo" | "video" | "general";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const media = await uploadMedia(file, usage);
      onChange(media.url);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Upload failed", description: err.message });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload
      </Button>
      {value && (
        <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
