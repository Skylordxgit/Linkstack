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

/**
 * Base URL for server components / route handlers (SSR data fetching).
 *
 * - Self-hosted (Hostinger etc.): the backend runs as a sibling process on
 *   the same machine, so this defaults to http://localhost:4000/api.
 * - Netlify: the API is a *separate* Netlify Function from the Next.js
 *   server runtime — there's no shared "localhost" between them — so SSR
 *   fetches instead go out over the network to this site's own public URL.
 *   Netlify sets `URL` automatically at runtime (the production domain, or
 *   the deploy-preview URL for previews) with no configuration needed.
 *
 * Set INTERNAL_API_URL explicitly to override either default.
 */
export function internalApiBase(): string {
  if (process.env.INTERNAL_API_URL) return process.env.INTERNAL_API_URL;
  if (process.env.URL) return `${process.env.URL}/api`;
  return "http://localhost:4000/api";
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
