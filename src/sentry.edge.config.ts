import { config } from "@/config";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  enabled:
    process.env.NODE_ENV !== "development" || config.sentry.trackInDevelopment,
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  tracesSampleRate: config.sentry.tracesSampleRate,
});
