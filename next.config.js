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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

