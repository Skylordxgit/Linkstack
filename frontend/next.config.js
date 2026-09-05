/** @type {import('next').NextConfig} */
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:4000";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      // Supabase Storage public URLs (media uploads) and any other https host.
      { protocol: "https", hostname: "**" },
    ],
  },
  // Local-dev convenience only: proxies /api/* to the standalone backend
  // process (BACKEND_ORIGIN, default http://localhost:4000) so the browser
  // can always call the relative /api path. In production this is never
  // reached — on Netlify, netlify.toml's own redirect intercepts /api/*
  // before it gets to Next.js at all; on a self-hosted VPS, Nginx does.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
