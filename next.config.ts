import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://sundaynightgames.com/:path*",
        permanent: true,
      },
    ];
  },
};



export default nextConfig;
