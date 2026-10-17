// Kept free of the posthog-js import so server components can use these too.

// Names are append-only: renaming an emitted event orphans its PostHog
// insights and dashboards.
export const ANALYTICS_EVENTS = {
  // Theme
  THEME_CHANGED: "theme_changed",

  // Command menu
  COMMAND_MENU_OPENED: "command_menu_opened",
  COMMAND_MENU_CLOSED: "command_menu_closed",

  // Navigation
  VIEW_BRAND_GUIDELINES: "view_brand_guidelines",

  // Outbound links
  REDIRECT_TO_GITHUB: "redirect_to_github",

  // Profile
  NAME_PRONUNCIATION_PLAYED: "name_pronunciation_played",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** The part of the page an event was fired from, sent as `section`. */
export const ANALYTICS_SECTIONS = {
  HEADER: "header",
  BOTTOM_NAV: "bottom_nav",
  COMMAND_MENU: "command_menu",
  PROFILE_HEADER: "profile_header",
} as const;

export type AnalyticsSection =
  (typeof ANALYTICS_SECTIONS)[keyof typeof ANALYTICS_SECTIONS];
