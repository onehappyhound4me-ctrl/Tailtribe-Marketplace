/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'uploadthing.com', 'images.unsplash.com'],
    unoptimized: true, // Disable image optimization for development
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

