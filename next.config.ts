import type { NextConfig } from "next";

// SEC-B3: bumped comment to force dev-server restart so the regenerated
// Prisma Client (now includes the AgentCredential model) is re-imported.
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Allow Shopee CDN product images to be optimized by next/image when
    // real product imagery is wired up. Local data: URLs (e.g. AI-generated
    // thumbnails returned as base64) are always allowed and need no entry.
    remotePatterns: [
      { protocol: 'https', hostname: '**.shopee.com.my' },
      { protocol: 'https', hostname: '**.shopee.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to every route.
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Disallow framing (clickjacking protection).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Enable browser XSS auditor (legacy, but still useful on older browsers).
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Only send the origin (not full URL) on cross-origin requests.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Lock down powerful browser features we don't use.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS for one year (incl. subdomains) once on HTTPS.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
};

export default nextConfig;
