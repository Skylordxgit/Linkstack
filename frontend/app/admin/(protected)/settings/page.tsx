"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getSettings, updateSettings, changePassword, type Settings } from "@/services/admin";
import { THEMES } from "@/lib/themes";

const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Dhaka", "Asia/Singapore", "Australia/Sydney"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Save failed", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Site-wide defaults and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Site</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Site Name">
            <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </Field>
          <Field label="Site URL">
            <Input value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} />
          </Field>
          <Field label="Default SEO Title">
            <Input value={settings.defaultSeoTitle} onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })} />
          </Field>
          <Field label="Default SEO Description">
            <Textarea
              value={settings.defaultSeoDescription}
              onChange={(e) => setSettings({ ...settings, defaultSeoDescription: e.target.value })}
            />
          </Field>
          <Field label="Default Theme">
            <Select value={settings.defaultTheme} onValueChange={(v) => setSettings({ ...settings, defaultTheme: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timezone">
            <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Analytics Retention (days)">
            <Input
              type="number"
              value={settings.analyticsRetentionDays}
              onChange={(e) => setSettings({ ...settings, analyticsRetentionDays: Number(e.target.value) })}
            />
          </Field>
          <Field label="Max Upload Size (MB)">
            <Input
              type="number"
              value={settings.maxUploadSizeMb}
              onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) })}
            />
          </Field>
          <Button onClick={save} disabled={saving} className="w-fit">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <PasswordCard />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const submit = async () => {
    if (next.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Use at least 8 characters." });
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(current, next);
      toast({ title: "Password changed" });
      setCurrent("");
      setNext("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not change password", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" /> Change Password
        </CardTitle>
        <CardDescription>Your admin credentials — keep this private.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field label="Current password">
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="New password">
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Button onClick={submit} disabled={submitting || !current || !next} className="w-fit">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </CardContent>
    </Card>
  );
}
