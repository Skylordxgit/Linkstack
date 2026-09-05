"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

export function ViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const params = new URLSearchParams(window.location.search);
    api
      .post(`/public/pages/${slug}/view`, {
        referrer: document.referrer || undefined,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
      })
      .catch(() => undefined);
  }, [slug]);

  return null;
}
