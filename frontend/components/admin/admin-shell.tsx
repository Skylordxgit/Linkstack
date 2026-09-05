"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  ImageIcon,
  LayoutTemplate,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";
import type { AdminUser } from "@/types";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin/login");
      router.refresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Logout failed", description: err.message });
    }
  };

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href));

  const SidebarContent = (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">LinkApp</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground",
                active && "bg-white/10 text-foreground shadow-inner"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {admin.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{admin.name}</p>
            <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/5 lg:block">
          <div className="glass-panel sticky top-0 h-screen [--glass-opacity:0.04] [--glass-blur:24px] [--glass-border-opacity:0.08]">
            {SidebarContent}
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="glass-panel relative h-full w-72 [--glass-opacity:0.5] [--glass-blur:24px]">
              {SidebarContent}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-background/70 px-5 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">LinkApp</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
