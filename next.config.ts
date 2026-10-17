import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    BUILD_TIMESTAMP: new Date().toISOString(),
    // Inlined so the client-rendered footer can read them.
    VERCEL_ENV: process.env.VERCEL_ENV ?? "",
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.microlink.io",
      },
      {
        protocol: "https",
        hostname: "assets.yash14.com",
      },
    ],
  },
  async rewrites() {
    return {
      // beforeFiles so this runs before prerendered pages are served;
      // afterFiles rewrites never fire for SSG pages on Vercel.
      beforeFiles: [
        {
          source: "/index.md",
          destination: "/llms.txt",
        },
      ],
    };
  },
};

export default nextConfig;
