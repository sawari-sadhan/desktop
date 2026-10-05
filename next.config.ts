import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5051',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  }
};

export default nextConfig;
