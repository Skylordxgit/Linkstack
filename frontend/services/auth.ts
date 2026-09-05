import { api } from "@/lib/api";
import type { AdminUser } from "@/types";

export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await api.post<AdminUser>("/auth/login", { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function me(): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>("/auth/me");
  return data;
}
