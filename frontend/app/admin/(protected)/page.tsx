"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Globe,
  Eye,
  MousePointerClick,
  Percent,
  TrendingUp,
  Star,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardSummary } from "@/services/admin";
import type { DashboardSummary } from "@/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  HIDDEN: "warning",
  ARCHIVED: "destructive",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of all your pages and their performance.</p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            Create Page
          </Link>
        </Button>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total Pages" value={data.totalPages} icon={FileText} accent="from-violet-500 to-indigo-500" />
          <StatCard label="Published" value={data.publishedPages} icon={Globe} accent="from-emerald-500 to-teal-500" />
          <StatCard label="Total Views" value={data.totalViews} icon={Eye} accent="from-sky-500 to-cyan-400" />
          <StatCard label="Total Clicks" value={data.totalClicks} icon={MousePointerClick} accent="from-fuchsia-500 to-pink-500" />
          <StatCard label="CTR" value={`${data.ctr}%`} icon={Percent} accent="from-amber-500 to-orange-500" />
        </div>
      )}

      {!loading && data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Most Viewed Page
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.mostViewedPage ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{data.mostViewedPage.name}</p>
                    <p className="text-sm text-muted-foreground">/{data.mostViewedPage.slug}</p>
                  </div>
                  <Badge>{data.mostViewedPage.views} views</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No views recorded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" /> Most Clicked Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.mostClickedLink ? (
                <div className="flex items-center justify-between">
                  <p className="font-medium">{data.mostClickedLink.title || "Untitled link"}</p>
                  <Badge>{data.mostClickedLink.clicks} clicks</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No clicks recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Pages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {data.recentPages.length === 0 && <p className="text-sm text-muted-foreground">No pages yet.</p>}
              {data.recentPages.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/pages/${p.id}/edit`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{p.slug}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {data.recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
              {data.recentActivity.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {a.action.replace(/\./g, " ").replace(/_/g, " ")}
                    {a.target ? ` — ${a.target}` : ""}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
