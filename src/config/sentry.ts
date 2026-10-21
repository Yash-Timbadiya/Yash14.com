/**
 * A DSN only allows sending events to the project, so it is safe to ship in
 * the client bundle. The env override lets a fork report to its own project.
 */
export const SENTRY_DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://4fd924afa4389599d0588e8a9470adb3@o4512294076416001.ingest.us.sentry.io/4512294137561088";

/** Separates Vercel preview deployments from production in Sentry. */
export const SENTRY_ENVIRONMENT =
  process.env.VERCEL_ENV || process.env.NODE_ENV;

/** Every trace locally, a tenth of them in production to stay within quota. */
export const SENTRY_TRACES_SAMPLE_RATE =
  process.env.NODE_ENV === "development" ? 1 : 0.1;
