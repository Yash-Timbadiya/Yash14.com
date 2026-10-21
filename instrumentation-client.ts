import posthog from "posthog-js";
import { config } from "@/config";
import * as Sentry from "@sentry/nextjs";
import { POSTHOG_PROXY_PATH, POSTHOG_UI_HOST } from "@/config/posthog";

// Initialized before PostHog so errors thrown below are reported too.
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  tracesSampleRate: config.sentry.tracesSampleRate,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const isDevelopment = process.env.NODE_ENV === "development";

if (isDevelopment && !config.analytics.trackInDevelopment) {
  // Left uninitialized, so trackEvent is a no-op and no pageviews are sent.
} else if (!projectToken) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }
} else if (!host) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
    );
  }
} else {
  // Pageviews, pageleaves and the site's own named events only. Every other
  // product is disabled here so that turning one on in the PostHog project
  // settings cannot start collecting data from this site.
  posthog.init(projectToken, {
    // Sent through this site's own domain (see next.config.ts) so ad
    // blockers do not drop the requests.
    api_host: POSTHOG_PROXY_PATH,
    ui_host: POSTHOG_UI_HOST,
    defaults: "2026-01-30",
    capture_pageview: "history_change",
    capture_pageleave: true,
    person_profiles: "identified_only",
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_conversations: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    disable_external_dependency_loading: true,
    debug: process.env.NODE_ENV === "development",
  });
}
