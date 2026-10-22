import type { NextConfig } from "next";

import {
  POSTHOG_ASSETS_HOST,
  POSTHOG_INGEST_HOST,
  POSTHOG_PROXY_PATH,
} from "./src/config/posthog";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // PostHog's API uses trailing slashes, which Next would otherwise redirect.
  skipTrailingSlashRedirect: true,
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
        // Reverse proxy for PostHog. The static rule must come first.
        {
          source: `${POSTHOG_PROXY_PATH}/static/:path*`,
          destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
        },
        {
          source: `${POSTHOG_PROXY_PATH}/:path*`,
          destination: `${POSTHOG_INGEST_HOST}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
