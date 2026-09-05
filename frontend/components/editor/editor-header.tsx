"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, AlertCircle, Save, Globe, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Page, PageStatus } from "@/types";
import type { SaveStatus } from "@/hooks/use-page-editor";

const STATUS_VARIANT: Record<PageStatus, "success" | "secondary" | "warning" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  HIDDEN: "warning",
  ARCHIVED: "destructive",
};

export function EditorHeader({
  page,
  saveStatus,
  onSaveNow,
  onTogglePublish,
}: {
  page: Page;
  saveStatus: SaveStatus;
  onSaveNow: () => void;
  onTogglePublish: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 flex flex-col gap-3 border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="truncate font-medium">{page.name}</p>
          <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
        </div>
        <Badge variant={STATUS_VARIANT[page.status]}>{page.status}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <SaveIndicator status={saveStatus} />
        <Button variant="outline" size="sm" onClick={onSaveNow}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button size="sm" onClick={onTogglePublish}>
          {page.status === "PUBLISHED" ? (
            <>
              <EyeOff className="h-4 w-4" /> Unpublish
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" /> Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    );
  if (status === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle className="h-3.5 w-3.5" /> Error saving
      </span>
    );
  return null;
}
