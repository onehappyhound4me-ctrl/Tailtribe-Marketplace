import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel builds in a monorepo can accidentally pick up the repo-root .eslintrc.json.
  // We still keep `npm run lint` for local/CI, but we don't fail production builds on ESLint config resolution.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
