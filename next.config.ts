import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
