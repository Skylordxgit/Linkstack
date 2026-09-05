import { api } from "@/lib/api";
import type { DashboardSummary, Media } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/admin/dashboard");
  return data;
}

export interface AnalyticsResult {
  range: { from: string; to: string };
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  ctr: number;
  topReferrers: { referrer: string | null; count: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  utmCampaigns: { campaign: string | null; count: number }[];
  topPages: { page: { id: string; name: string; slug: string } | undefined; views: number }[];
  topLinks: { block: { id: string; title: string | null; pageId: string } | undefined; clicks: number }[];
}

export async function getAnalytics(params: { range?: string; from?: string; to?: string } = {}): Promise<AnalyticsResult> {
  const { data } = await api.get<AnalyticsResult>("/admin/analytics", { params });
  return data;
}

export async function getPageAnalytics(pageId: string, params: { range?: string; from?: string; to?: string } = {}): Promise<AnalyticsResult> {
  const { data } = await api.get<AnalyticsResult>(`/admin/analytics/pages/${pageId}`, { params });
  return data;
}

export async function listMedia(kind?: string): Promise<Media[]> {
  const { data } = await api.get<Media[]>("/admin/media", { params: kind ? { kind } : {} });
  return data;
}

export async function uploadMedia(file: File, usage: string): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  form.append("usage", usage);
  const { data } = await api.post<Media>("/admin/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteMedia(id: string): Promise<void> {
  await api.delete(`/admin/media/${id}`);
}

export interface Settings {
  siteName: string;
  siteUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultTheme: string;
  timezone: string;
  analyticsRetentionDays: number;
  maxUploadSizeMb: number;
  [key: string]: unknown;
}

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get<Settings>("/admin/settings");
  return data;
}

export async function updateSettings(input: Partial<Settings>): Promise<Settings> {
  const { data } = await api.put<Settings>("/admin/settings", input);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post("/admin/settings/change-password", { currentPassword, newPassword });
}

export interface TemplateSummary {
  id: string;
  name: string;
  description?: string | null;
  isBuiltIn: boolean;
  blockCount?: number;
}

export async function listTemplates(): Promise<{ builtIn: TemplateSummary[]; saved: TemplateSummary[] }> {
  const { data } = await api.get("/admin/templates");
  return data;
}

export async function saveTemplate(input: { name: string; description?: string; pageId: string }): Promise<TemplateSummary> {
  const { data } = await api.post<TemplateSummary>("/admin/templates", input);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/admin/templates/${id}`);
}
