import type { AnalyticsEvent, AnalyticsSection } from "@/lib/analytics-events";

import posthog from "posthog-js";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

export type AnalyticsProperties = {
  section: AnalyticsSection;
} & Record<string, string | number | boolean | null | undefined>;

export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties,
) {
  // posthog is only initialized when the project token and host are set.
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

/** Tracks a click on a site navigation item, for the items that have an event. */
export function trackNavItemClick(href: string, section: AnalyticsSection) {
  if (href === "/") {
    trackEvent(ANALYTICS_EVENTS.VIEW_HOME, { section });
  } else if (href === "/brand-guidelines") {
    trackEvent(ANALYTICS_EVENTS.VIEW_BRAND_GUIDELINES, { section });
  }
}
