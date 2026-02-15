/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'uploadthing.com', 'images.unsplash.com', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Disable image optimization for development
  },
  webpack: (cfg, { isServer }) => {
    cfg.watchOptions = {
      poll: 2000,
      aggregateTimeout: 600,
      ignored: ['**/node_modules', '**/.next-local', '**/.git', '**/prisma/dev.db*'],
    };
    // Disable caching for OneDrive compatibility
    cfg.cache = false;
    cfg.snapshot = {
      managedPaths: [],
      immutablePaths: [],
      buildDependencies: {
        hash: false,
        timestamp: true,
      },
    };
    return cfg;
  },
  // distDir: '.next-local', // Disabled for production
  experimental: {
    // Disable features that cause file locks
    caseSensitiveRoutes: false,
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js uses inline scripts for hydration/runtime; keep unsafe-inline.
      // IMPORTANT: do not allow unsafe-eval in production.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://cdn.vercel-insights.com https://vitals.vercel-insights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' blob: data: https: https://www.google-analytics.com https://stats.g.doubleclick.net",
      // GA4 measurement hits must be allowed here (connect-src).
      "connect-src 'self' https://www.tailtribe.nl https://tailtribe.nl https://tailtribe.be https://www.tailtribe.be https://vitals.vercel-insights.com https://vercel.live https://www.google-analytics.com https://region1.google-analytics.com https://region2.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

