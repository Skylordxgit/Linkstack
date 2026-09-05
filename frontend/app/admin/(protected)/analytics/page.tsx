"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Users, MousePointerClick, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/admin/stat-card";
import { getAnalytics, type AnalyticsResult } from "@/services/admin";

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalytics({ range })
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Aggregate performance across all pages.</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r.id ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Views" value={data.totalViews} icon={Eye} accent="from-sky-500 to-cyan-400" />
            <StatCard label="Unique Visitors" value={data.uniqueVisitors} icon={Users} accent="from-violet-500 to-indigo-500" />
            <StatCard label="Clicks" value={data.totalClicks} icon={MousePointerClick} accent="from-fuchsia-500 to-pink-500" />
            <StatCard label="CTR" value={`${data.ctr}%`} icon={Percent} accent="from-amber-500 to-orange-500" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                {data.devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.devices}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="device" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browsers</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                {data.browsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.browsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="browser" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topPages.length === 0 && <p className="text-sm text-muted-foreground">No views yet.</p>}
                {data.topPages.map((p, i) => (
                  <Link
                    key={i}
                    href={p.page ? `/admin/pages/${p.page.id}/edit` : "#"}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-white/5"
                  >
                    <span className="truncate">{p.page?.name ?? "Deleted page"}</span>
                    <span className="text-muted-foreground">{p.views}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topLinks.length === 0 && <p className="text-sm text-muted-foreground">No clicks yet.</p>}
                {data.topLinks.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{l.block?.title || "Untitled"}</span>
                    <span className="text-muted-foreground">{l.clicks}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.topReferrers.length === 0 && <p className="text-sm text-muted-foreground">No referrer data yet.</p>}
                {data.topReferrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{r.referrer || "Direct"}</span>
                    <span className="text-muted-foreground">{r.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {data.utmCampaigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>UTM Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.utmCampaigns.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="truncate">{c.campaign}</span>
                    <span className="text-muted-foreground">{c.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
