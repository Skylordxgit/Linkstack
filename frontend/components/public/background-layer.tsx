"use client";

import type { BackgroundConfig } from "@/types";
import { backgroundStyle } from "@/lib/render-helpers";

const BLOB_LAYOUT = [
  { top: "5%", left: "10%", size: 220, delay: "0s", color: "var(--c1, #8b5cf6)" },
  { top: "55%", left: "70%", size: 260, delay: "1.5s", color: "var(--c2, #0ea5e9)" },
  { top: "70%", left: "5%", size: 180, delay: "3s", color: "var(--c3, #22d3ee)" },
];

const PARTICLE_COUNT = 24;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  left: `${(i * 137) % 100}%`,
  top: `${(i * 71) % 100}%`,
  size: 2 + (i % 4),
  delay: `${(i % 6) * 0.8}s`,
  duration: `${5 + (i % 5)}s`,
}));

export function BackgroundLayer({ background }: { background: BackgroundConfig }) {
  const { className, style } = backgroundStyle(background);
  const overlayOpacity = background.overlayOpacity ?? 0;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 ${className}`} style={style} />

      {background.type === "video" && background.videoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={background.videoAutoplay !== false}
          muted={background.videoMuted !== false}
          loop={background.videoLoop !== false}
          playsInline
          poster={background.videoFallbackImage}
        >
          <source src={background.videoUrl} />
        </video>
      )}

      {background.type === "blobs" &&
        BLOB_LAYOUT.map((b, i) => (
          <div
            key={i}
            className="blob"
            style={{
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              background: b.color,
              animationDelay: b.delay,
            }}
          />
        ))}

      {background.type === "particles" &&
        PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

      {overlayOpacity > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />}
    </div>
  );
}
