export const config = {
  runtime: {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
  },

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yash14.com",
  },

  cdn: {
    /** Public base URL of the Cloudflare R2 bucket (custom domain). */
    url: process.env.NEXT_PUBLIC_CDN_URL,
  },

  github: {
    apiToken: process.env.GITHUB_API_TOKEN,
    contributionsApiUrl: process.env.GITHUB_CONTRIBUTIONS_API_URL,
  },

  dmca: {
    url: process.env.NEXT_PUBLIC_DMCA_URL,
  },

  analytics: {
    posthogProjectToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },

  /**
   * Stamped into the bundle by `next.config.ts` (its `env` option), so they
   * also work in client components.
   */
  build: {
    timestamp: process.env.BUILD_TIMESTAMP,
    vercelEnv: process.env.VERCEL_ENV,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  },
} as const;
