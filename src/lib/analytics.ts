import posthog from "posthog-js";

export type AnalyticsEventName =
  | "theme_changed"
  | "command_menu_opened"
  | "command_menu_closed"
  | "name_pronunciation_played";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export function trackEvent(
  name: AnalyticsEventName,
  properties?: AnalyticsProperties,
) {
  // posthog is only initialized when the project token and host are set.
  if (!posthog.__loaded) return;
  posthog.capture(name, properties);
}
