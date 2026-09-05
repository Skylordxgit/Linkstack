"use client";

import { useMemo } from "react";
import type { Page } from "@/types";
import { getTheme } from "@/lib/themes";
import { glassCssVars } from "@/lib/render-helpers";
import { BackgroundLayer } from "@/components/public/background-layer";
import { ProfileHeader } from "@/components/public/profile-header";
import { BlockRenderer } from "@/components/public/block-renderer";
import { SocialIconsRow } from "@/components/public/social-icons";
import { ShareBar } from "@/components/public/share-bar";

export function PageRenderer({
  page,
  mode = "public",
  className = "",
}: {
  page: Page;
  mode?: "public" | "preview";
  className?: string;
}) {
  const theme = getTheme(page.theme);
  const background = { ...theme.background, ...page.backgroundConfig };
  const appearance = { ...theme.appearance, ...page.appearanceConfig };
  const textColor = (appearance.textColor as string) || theme.textColor;

  const blocks = useMemo(() => [...(page.blocks ?? [])].sort((a, b) => a.position - b.position), [page.blocks]);
  const socials = page.socialLinks ?? [];

  return (
    <div
      className={`relative isolate flex min-h-full w-full flex-col items-center overflow-hidden px-5 py-10 ${className}`}
      style={{ color: textColor, ...glassCssVars(appearance) }}
    >
      <BackgroundLayer background={background} />

      <div className="flex w-full max-w-[420px] flex-col items-center gap-6">
        <ProfileHeader page={page} />

        <div className="flex w-full flex-col gap-3">
          {blocks.map((block) =>
            block.type === "SOCIAL_ICONS" ? (
              block.enabled && <SocialIconsRow key={block.id} socials={socials} appearance={appearance} />
            ) : (
              <BlockRenderer key={block.id} block={block} appearance={appearance} mode={mode} />
            )
          )}
        </div>

        {mode === "public" && <ShareBar page={page} />}

        {page.footerEnabled && (
          <footer className="mt-4 flex flex-col items-center gap-1 text-center text-xs opacity-50">
            {page.footerText && <p>{page.footerText}</p>}
            <p>© {new Date().getFullYear()}</p>
          </footer>
        )}
      </div>
    </div>
  );
}
