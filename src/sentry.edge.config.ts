import { config } from "@/config";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  tracesSampleRate: config.sentry.tracesSampleRate,
});
