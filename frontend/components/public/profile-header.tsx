"use client";

import { BadgeCheck, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Page } from "@/types";

const SHAPE_CLASS: Record<Page["profileShape"], string> = {
  CIRCLE: "rounded-full",
  ROUNDED: "rounded-3xl",
  SQUARE: "rounded-md",
};

export function ProfileHeader({ page }: { page: Page }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={cn("overflow-hidden bg-white/10 shadow-xl ring-4 ring-white/10", SHAPE_CLASS[page.profileShape])}
        style={{ width: page.profileSize, height: page.profileSize }}
      >
        {page.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.avatarUrl} alt={page.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold opacity-60">
            {page.title?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold">{page.title}</h1>
        {page.verified && <BadgeCheck className="h-5 w-5 text-sky-400" />}
      </div>

      {page.subtitle && <p className="text-sm opacity-80">{page.subtitle}</p>}
      {page.bio && <p className="max-w-xs text-sm opacity-70">{page.bio}</p>}
      {page.location && (
        <div className="flex items-center gap-1 text-xs opacity-60">
          <MapPin className="h-3.5 w-3.5" />
          {page.location}
        </div>
      )}
    </div>
  );
}
