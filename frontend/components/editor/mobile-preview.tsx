"use client";

import { useState } from "react";
import { Smartphone, Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageRenderer } from "@/components/public/page-renderer";
import type { Page } from "@/types";

export function MobilePreview({ page }: { page: Page }) {
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">
        <Button variant={device === "mobile" ? "default" : "ghost"} size="sm" onClick={() => setDevice("mobile")}>
          <Smartphone className="h-4 w-4" /> Mobile
        </Button>
        <Button variant={device === "desktop" ? "default" : "ghost"} size="sm" onClick={() => setDevice("desktop")}>
          <Monitor className="h-4 w-4" /> Desktop
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> Open Live Page
          </a>
        </Button>
      </div>

      {device === "mobile" ? (
        <div className="relative h-[640px] w-[320px] shrink-0 rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="absolute left-1/2 top-2 z-10 h-4 w-24 -translate-x-1/2 rounded-full bg-zinc-800" />
          <div className="h-full w-full overflow-y-auto rounded-[2rem]">
            <PageRenderer page={page} mode="preview" className="min-h-full py-8" />
          </div>
        </div>
      ) : (
        <div className="h-[500px] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
          <PageRenderer page={page} mode="preview" className="min-h-full" />
        </div>
      )}
    </div>
  );
}
