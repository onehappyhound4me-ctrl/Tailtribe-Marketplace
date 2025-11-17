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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://cdn.vercel-insights.com https://vitals.vercel-insights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' blob: data: https:",
              "connect-src 'self' https://www.tailtribe.nl https://vitals.vercel-insights.com",
              "frame-ancestors 'self'",
              "object-src 'none'",
            ].join('; '),
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://cdn.vercel-insights.com https://vitals.vercel-insights.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' blob: data: https:",
              "connect-src 'self' https://www.tailtribe.nl https://vitals.vercel-insights.com",
              "frame-ancestors 'self'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

