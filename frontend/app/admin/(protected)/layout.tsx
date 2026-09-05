import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { AdminUser } from "@/types";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await serverFetch<AdminUser>("/auth/me");

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell admin={admin!}>{children}</AdminShell>;
}
