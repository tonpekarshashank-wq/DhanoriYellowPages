import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Use the standalone output for Vercel deployment */
  output: "standalone",

  /* Strict React mode for catching bugs */
  reactStrictMode: true,

  /* Disable powered-by header */
  poweredByHeader: false,

  /* Headers for security and caching */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
