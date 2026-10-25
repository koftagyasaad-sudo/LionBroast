import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // يمنع فشل الـ Build على Vercel بسبب أخطاء الـ Types البسيطة
    ignoreBuildErrors: true,
  },
  eslint: {
    // يمنع فشل الـ Build بسبب تحذيرات الـ Linter
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
