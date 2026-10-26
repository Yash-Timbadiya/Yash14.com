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

  roast: {
    /** Google PageSpeed Insights key. Without one, Google's shared quota runs dry fast. */
    pagespeedApiKey: process.env.PAGESPEED_API_KEY,
    /** Upstash Redis for the rate limit and result cache. The Vercel integration sets the KV_ names. */
    redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
    redisToken:
      process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
    /**
     * Writes the personal roast lines. Models are tried in order; without a
     * key, or when all of them fail, the prewritten lines are used.
     */
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      models: (
        process.env.OPENROUTER_MODELS ||
        "nvidia/nemotron-3.5-super-vl:free,nvidia/nemotron-3.5-lightning:free"
      )
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean),
    },
  },

  dmca: {
    url: process.env.NEXT_PUBLIC_DMCA_URL,
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
