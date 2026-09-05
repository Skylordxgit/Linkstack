"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Eye,
  ExternalLink,
  Copy,
  Files,
  Globe,
  EyeOff,
  Archive,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { DuplicateDialog } from "@/components/admin/duplicate-dialog";
import { listPages, deletePage, setPageStatus } from "@/services/pages";
import type { Page, PageStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<PageStatus, "success" | "secondary" | "warning" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  HIDDEN: "warning",
  ARCHIVED: "destructive",
};

const FILTERS: { label: string; value: PageStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Hidden", value: "HIDDEN" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PageStatus | "ALL">("ALL");
  const [duplicateTarget, setDuplicateTarget] = useState<Page | null>(null);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPages({ search: search || undefined, status: status === "ALL" ? undefined : status });
      setPages(res.items);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load pages", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleStatus = async (page: Page, action: "publish" | "unpublish" | "archive" | "hide") => {
    try {
      await setPageStatus(page.id, action);
      toast({ title: `Page ${action}ed`, description: `"${page.name}" updated.` });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    }
  };

  const handleDelete = async (page: Page) => {
    const ok = await confirm({
      title: "Delete page?",
      description: `This permanently deletes "${page.name}" and all its blocks, socials and analytics. This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePage(page.id);
      toast({ title: "Page deleted" });
      load();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete failed", description: err.message });
    }
  };

  const copyUrl = async (page: Page) => {
    await navigator.clipboard.writeText(`${siteUrl}/${page.slug}`);
    toast({ title: "URL copied to clipboard" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">{pages.length} page(s)</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            Create Page
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={status} onValueChange={(v) => setStatus(v as PageStatus | "ALL")}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-muted-foreground">No pages found.</p>
          <Button asChild>
            <Link href="/admin/pages/new">
              <Plus className="h-4 w-4" />
              Create your first page
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="flex flex-col overflow-hidden">
              <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-cyan-500/30">
                {page.avatarUrl ? (
                  <Image src={page.avatarUrl} alt={page.name} fill className="object-cover opacity-80" />
                ) : (
                  <User className="h-10 w-10 text-white/40" />
                )}
                <Badge variant={STATUS_VARIANT[page.status]} className="absolute right-3 top-3">
                  {page.status}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{page.name}</p>
                  <p className="truncate text-sm text-muted-foreground">/{page.slug}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <p className="font-semibold">{page.views ?? 0}</p>
                    <p className="text-muted-foreground">Views</p>
                  </div>
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <p className="font-semibold">{page.clicks ?? 0}</p>
                    <p className="text-muted-foreground">Clicks</p>
                  </div>
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <p className="font-semibold">{page.ctr ?? 0}%</p>
                    <p className="text-muted-foreground">CTR</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Updated {formatDate(page.updatedAt)}</p>

                <div className="mt-auto flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/admin/pages/${page.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/pages/${page.id}/edit`}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/${page.slug}?preview=1`} target="_blank" rel="noreferrer">
                          <Eye className="h-4 w-4" /> Preview
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" /> Open
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => copyUrl(page)}>
                        <Copy className="h-4 w-4" /> Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setDuplicateTarget(page)}>
                        <Files className="h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {page.status !== "PUBLISHED" && (
                        <DropdownMenuItem onSelect={() => handleStatus(page, "publish")}>
                          <Globe className="h-4 w-4" /> Publish
                        </DropdownMenuItem>
                      )}
                      {page.status === "PUBLISHED" && (
                        <DropdownMenuItem onSelect={() => handleStatus(page, "unpublish")}>
                          <EyeOff className="h-4 w-4" /> Unpublish
                        </DropdownMenuItem>
                      )}
                      {page.status !== "ARCHIVED" && (
                        <DropdownMenuItem onSelect={() => handleStatus(page, "archive")}>
                          <Archive className="h-4 w-4" /> Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onSelect={() => handleDelete(page)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {duplicateTarget && (
        <DuplicateDialog page={duplicateTarget} onClose={() => setDuplicateTarget(null)} onDuplicated={load} />
      )}
      <ConfirmDialog />
    </div>
  );
}
