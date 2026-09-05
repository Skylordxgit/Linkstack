import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error?.response?.data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

/** Base URL for server components / route handlers, which talk to the backend directly. */
export function internalApiBase(): string {
  return process.env.INTERNAL_API_URL || "http://localhost:4000/api";
}

/** Fetch wrapper for server components: forwards the admin cookie and returns parsed JSON or null on failure. */
export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${internalApiBase()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as T;
}
