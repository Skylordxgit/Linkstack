"use client";

import { useEffect, useState } from "react";
import { LayoutTemplate, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useConfirm } from "@/components/admin/confirm-dialog";
import { listTemplates, deleteTemplate, type TemplateSummary } from "@/services/admin";
import Link from "next/link";

export default function TemplatesPage() {
  const [builtIn, setBuiltIn] = useState<TemplateSummary[]>([]);
  const [saved, setSaved] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    const res = await listTemplates();
    setBuiltIn(res.builtIn);
    setSaved(res.saved);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (t: TemplateSummary) => {
    const ok = await confirm({
      title: "Delete template?",
      description: `"${t.name}" will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    await deleteTemplate(t.id);
    toast({ title: "Template deleted" });
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Starting points for new pages. Save any page as a template from its editor.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Built-in</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {builtIn.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <LayoutTemplate className="h-4 w-4 text-primary" /> {t.name}
                    </CardTitle>
                    <CardDescription>{t.blockCount ?? 0} block(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/admin/pages/new`}>Use Template</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Saved by you</h2>
            {saved.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No saved templates yet. Open a page editor and use "Save as Template" from Settings.
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((t) => (
                  <Card key={t.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4 text-primary" /> {t.name}
                        </span>
                        <Badge variant="secondary">Custom</Badge>
                      </CardTitle>
                      {t.description && <CardDescription>{t.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(t)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <ConfirmDialog />
    </div>
  );
}
