import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Note: bundle analyzer config would go here in production
  // For now, ensure code splitting is working (all 36 pages are lazy-loaded
  // via React.lazy() in src/app/page.tsx, and chart-heavy libraries like
  // `recharts` are therefore code-split per page chunk automatically).
  images: {
    // Allow Shopee CDN product images to be optimized by next/image when
    // real product imagery is wired up. Local data: URLs (e.g. AI-generated
    // thumbnails returned as base64) are always allowed and need no entry.
    remotePatterns: [
      { protocol: 'https', hostname: '**.shopee.com.my' },
      { protocol: 'https', hostname: '**.shopee.com' },
    ],
  },
};

export default nextConfig;
