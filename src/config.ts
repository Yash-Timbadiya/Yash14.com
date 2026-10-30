export const config = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yash14.com",
    env: process.env.NODE_ENV,
  },

  cdn: {
    /** Public base URL of the Cloudflare R2 bucket (custom domain). */
    url: process.env.NEXT_PUBLIC_CDN_URL,
  },

  github: {
    apiUrl: "https://api.github.com",
    apiToken: process.env.GITHUB_API_TOKEN,
    contributionsApiUrl: process.env.GITHUB_CONTRIBUTIONS_API_URL,
  },

  /** Renders the live screenshots shown in link previews. */
  microlink: {
    apiUrl: "https://api.microlink.io",
  },

  analytics: {
    /**
     * Whether PostHog runs during `next dev`. Off keeps local clicks out of
     * production insights; turn it on to debug events end to end.
     */
    trackInDevelopment: false,
    /** PostHog's ingestion host for this project's region (US Cloud). */
    posthogHost:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  },

  roast: {
    pagespeedEndpoint:
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
    /** Google PageSpeed Insights key. Without one, Google's shared quota runs dry fast. */
    pagespeedApiKey: process.env.PAGESPEED_API_KEY,
    /** Upstash Redis for the rate limit and result cache. The Vercel integration sets the KV_ names. */
    redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
    redisToken:
      process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
    /**
     * Writes the personal roast lines. Groq is tried first, then OpenRouter;
     * a provider without a key is skipped, and when both fail the prewritten
     * lines are used.
     */
    groq: {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b",
    },
    openrouter: {
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: "nvidia/nemotron-3.5-lightning:free",
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
