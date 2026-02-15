import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isProd = !isDev;
const hasAnalytics = Boolean(
  String(process.env.NEXT_PUBLIC_GA_ID ?? "").trim() || String(process.env.NEXT_PUBLIC_GTM_ID ?? "").trim()
)

function assertNoTrailingSlashEnv(name: string) {
  const v = String(process.env[name] ?? "").trim();
  if (!v) return;
  if (v.endsWith("/")) {
    throw new Error(`[env] Invalid ${name}: must not end with '/'. Example: https://tailtribe.be`);
  }
}

// Production parity checks at build time (fail fast, avoid "works in dev, breaks in prod").
if (isProd) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("[env] NEXT_PUBLIC_APP_URL ontbreekt. Zet dit in Vercel (Production) en redeploy.");
  }
  assertNoTrailingSlashEnv("NEXT_PUBLIC_APP_URL");
  assertNoTrailingSlashEnv("AUTH_URL");
  assertNoTrailingSlashEnv("NEXTAUTH_URL");
}

const nextConfig: NextConfig = {
  // Vercel builds in a monorepo can accidentally pick up the repo-root .eslintrc.json.
  // We still keep `npm run lint` for local/CI, but we don't fail production builds on ESLint config resolution.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Local dev (incl. iPhone testing over LAN) can fail to serve `/_next/image`
    // depending on environment/binaries. When unoptimized, Next/Image uses the
    // original asset URL (e.g. /assets/...) which is much more reliable locally.
    // Keep optimization enabled in production (Vercel).
    unoptimized: isDev,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  // Allow accessing dev server from LAN devices (iPhone Safari).
  // This avoids warnings for cross-origin requests to /_next/* in newer Next versions.
  ...(isDev
    ? {
        allowedDevOrigins: [
          // NOTE: Next expects hostnames here (no scheme).
          'localhost',
          '127.0.0.1',
          '0.0.0.0',
          // LAN (iPhone testing). If your IP changes, update this value.
          '192.168.1.5',
        ],
      }
    : {}),
  async redirects() {
    return [
      // Ensure /favicon.ico never shows the default Vercel icon.
      {
        source: "/favicon.ico",
        destination: "/tailtribe_logo_masked_1751977129022.png",
        permanent: true,
      },
    ];
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      // Next.js uses some inline scripts for hydration/runtime. Without 'unsafe-inline',
      // browsers can block JS and the UI can get stuck on "Laden...".
      // GA4 / gtag can require eval/new Function in some environments; allow unsafe-eval only when analytics is enabled.
      `script-src 'self' 'unsafe-inline'${isDev || hasAnalytics ? " 'unsafe-eval'" : ""} https:`,
      "connect-src 'self' https: wss:",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          // Baseline browser hardening. Keep safe defaults; avoid breaking embedded flows.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=()",
          },
          // HSTS only in production (requires HTTPS).
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
