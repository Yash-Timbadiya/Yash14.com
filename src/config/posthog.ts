/**
 * Same-origin path that Next.js rewrites to PostHog (see `next.config.ts`), so
 * ad blockers that block posthog.com still let analytics through. Kept
 * deliberately bland: blockers match names like `/analytics` or `/posthog`.
 */
export const POSTHOG_PROXY_PATH = "/relay-yt";

/** PostHog's ingestion host for this project's region (US Cloud). */
export const POSTHOG_INGEST_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/** Static SDK assets are served from a separate host in the same region. */
export const POSTHOG_ASSETS_HOST = POSTHOG_INGEST_HOST.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com",
);

/** The PostHog app, for links back from the SDK, such as the toolbar. */
export const POSTHOG_UI_HOST = POSTHOG_INGEST_HOST.replace(
  ".i.posthog.com",
  ".posthog.com",
);
