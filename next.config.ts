import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
