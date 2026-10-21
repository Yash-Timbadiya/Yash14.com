export const config = {
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

  analytics: {
    /**
     * Whether PostHog runs during `next dev`. Off keeps local clicks out of
     * production insights; turn it on to debug events end to end.
     */
    trackInDevelopment: false,
  },

  dmca: {
    url: process.env.NEXT_PUBLIC_DMCA_URL,
  },

  sentry: {
    org: "yash14",
    project: "portfolio",
    /**
     * A DSN only allows sending events to the project, so it is safe to ship
     * in the client bundle. The env override lets a fork report to its own.
     */
    dsn:
      process.env.NEXT_PUBLIC_SENTRY_DSN ||
      "https://4fd924afa4389599d0588e8a9470adb3@o4512294076416001.ingest.us.sentry.io/4512294137561088",
    /** Build-time only; source maps are uploaded when it is set. */
    authToken: process.env.SENTRY_AUTH_TOKEN,
    /** Separates Vercel preview deployments from production. */
    environment: process.env.NODE_ENV,
    /** Every trace locally, a tenth of them in production to stay within quota. */
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
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
