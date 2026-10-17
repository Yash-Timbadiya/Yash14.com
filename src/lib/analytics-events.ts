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

  // Logo and its right-click brand menu
  LOGO_CLICK: "logo_click",
  LOGO_RIGHT_CLICK: "logo_right_click",
  COPY_MARK_SVG: "copy_mark_svg",
  COPY_LOGOTYPE_SVG: "copy_logotype_svg",
  DOWNLOAD_BRAND_ASSETS: "download_brand_assets",

  // Outbound links
  REDIRECT_TO_GITHUB: "redirect_to_github",

  // Profile
  NAME_PRONUNCIATION_PLAYED: "name_pronunciation_played",

  // Isometric YT mark and its right-click car picker
  YT_MARK_CLICK: "yt_mark_click",
  YT_MARK_RIGHT_CLICK: "yt_mark_right_click",
  CAR_MODEL_CHANGED: "car_model_changed",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** The part of the page an event was fired from, sent as `section`. */
export const ANALYTICS_SECTIONS = {
  HEADER: "header",
  BOTTOM_NAV: "bottom_nav",
  COMMAND_MENU: "command_menu",
  PROFILE_HEADER: "profile_header",
  BRAND_GUIDELINES: "brand_guidelines",
} as const;

export type AnalyticsSection =
  (typeof ANALYTICS_SECTIONS)[keyof typeof ANALYTICS_SECTIONS];

/**
 * What inside a section fired the event, sent as `source`. Tells apart the
 * same event fired from different controls, such as `view_brand_guidelines`
 * from the logo menu versus the header nav link.
 */
export const ANALYTICS_SOURCES = {
  LOGO_MENU: "logo_menu",
} as const;

export type AnalyticsSource =
  (typeof ANALYTICS_SOURCES)[keyof typeof ANALYTICS_SOURCES];
