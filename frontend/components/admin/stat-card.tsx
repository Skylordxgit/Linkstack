import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, accent = "from-violet-500 to-cyan-400", hint }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
            accent
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-semibold">{value}</p>
          {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
