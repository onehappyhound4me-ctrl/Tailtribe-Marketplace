/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'uploadthing.com', 'images.unsplash.com'],
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
        source: '/(.*)',
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
        ],
      },
    ]
  },
}

module.exports = nextConfig

