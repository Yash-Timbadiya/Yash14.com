import type { NextConfig } from "next";

import {
  POSTHOG_ASSETS_HOST,
  POSTHOG_INGEST_HOST,
  POSTHOG_PROXY_PATH,
} from "./src/config/posthog";

// The resume lives at /cv and is served on its own subdomain.
const CV_ORIGIN = "https://cv.yash14.com";
const CV_HOST = [{ type: "host" as const, value: String.raw`cv\..+` }];
const MAIN_HOST = [
  { type: "host" as const, value: String.raw`(www\.)?yash14\.com` },
];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Next's gzip stream in dev piles up "drain" listeners across streamed
  // responses (MaxListenersExceededWarning). Compression only matters for
  // `next start`; Vercel compresses at its edge either way.
  compress: process.env.NODE_ENV !== "development",
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
  async redirects() {
    return [
      // One canonical address for the resume.
      {
        source: "/cv",
        has: MAIN_HOST,
        destination: CV_ORIGIN,
        permanent: true,
      },
      // The subdomain only serves the resume; anything else belongs to the
      // main site. Next assets, the PostHog proxy and files are left alone.
      {
        source: String.raw`/:path((?!_next|${POSTHOG_PROXY_PATH.slice(1)}|.*\.).+)`,
        has: CV_HOST,
        destination: "https://yash14.com/:path",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles so this runs before prerendered pages are served;
      // afterFiles rewrites never fire for SSG pages on Vercel.
      beforeFiles: [
        {
          source: "/",
          has: CV_HOST,
          destination: "/cv",
        },
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
