import type { NextConfig } from "next";

/**
 * Production config.
 *
 *  - `output: "standalone"` → tiny self-contained server for Cloud Run / Docker.
 *  - Security + caching headers are set here so they apply identically on
 *    Cloud Run and behind Firebase Hosting's CDN.
 *  - HTML is cached at the CDN edge for a short window (s-maxage) so most
 *    visits never wake Cloud Run; hashed assets are immutable for a year.
 */
const isDev = process.env.NODE_ENV !== "production";

/* Content-Security-Policy.
   Next.js emits small inline bootstrap scripts, so script-src needs 'unsafe-inline'
   (a nonce-based CSP would force every page to render dynamically and lose CDN
   caching). Everything else is locked to same-origin. PostHog is allowed only
   when NEXT_PUBLIC_POSTHOG_HOST is configured. */
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || (process.env.NEXT_PUBLIC_POSTHOG_KEY ? "https://us.i.posthog.com" : "");
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${posthogHost ? ` ${posthogHost.replace("i.posthog", "assets.i.posthog")} ${posthogHost}` : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${posthogHost ? ` ${posthogHost}` : ""}${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 95],
    deviceSizes: [640, 828, 1080, 1280, 1536, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // (/_next/static is already served `immutable` by Next.js itself.)
      // Static media in /public: long-lived (filenames change when content does).
      { source: "/(fonts|images|icons)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // HTML: let the CDN (Firebase Hosting) keep it for 5 min, serve stale while revalidating.
      // Next's default for static pages is s-maxage=1y, which would pin old HTML (pointing at
      // old chunk hashes) at the edge after a Cloud Run-only redeploy.
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=300, stale-while-revalidate=86400" }],
      },
      // The service worker must always revalidate so updates roll out.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
