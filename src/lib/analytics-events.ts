// Kept free of the posthog-js import so server components can use these too.

// Names are append-only: renaming an emitted event orphans its PostHog
// insights and dashboards.
export const ANALYTICS_EVENTS = {
  // Theme
  THEME_CHANGED: "theme_changed",

  // Command menu
  COMMAND_MENU_OPENED: "command_menu_opened",
  COMMAND_MENU_CLOSED: "command_menu_closed",

  // Mobile bottom nav menu
  MOBILE_MENU_OPENED: "mobile_menu_opened",
  MOBILE_MENU_CLOSED: "mobile_menu_closed",

  // Keyboard shortcuts
  SHORTCUT_USED: "shortcut_used",

  // Navigation
  VIEW_BRAND_GUIDELINES: "view_brand_guidelines",
  VIEW_HOME: "view_home",
  VIEW_SECTION: "view_section",
  VIEW_EXPERIENCE: "view_experience",
  VIEW_LLMS_TXT: "view_llms_txt",

  // Contact
  EMAIL_CLICK: "email_click",
  EMAIL_COPY: "email_copy",
  PHONE_NUMBER_CLICK: "phone_number_click",
  PHONE_NUMBER_COPY: "phone_number_copy",
  DOWNLOAD_VCARD: "download_vcard",

  // Logo and its right-click brand menu
  LOGO_CLICK: "logo_click",
  LOGO_RIGHT_CLICK: "logo_right_click",
  COPY_MARK_SVG: "copy_mark_svg",
  COPY_LOGOTYPE_SVG: "copy_logotype_svg",
  DOWNLOAD_BRAND_ASSETS: "download_brand_assets",

  // Outbound links
  REDIRECT_TO_GITHUB: "redirect_to_github",
  REDIRECT_TO_X: "redirect_to_x",
  REDIRECT_TO_LINKEDIN: "redirect_to_linkedin",
  REDIRECT_TO_COMPANY: "redirect_to_company",
  REDIRECT_TO_WEBSITE: "redirect_to_website",
  REDIRECT_TO_CREATIVE_PORTFOLIO: "redirect_to_creative_portfolio",
  VIEW_LOCATION_MAP: "view_location_map",

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
  OVERVIEW: "overview",
  SOCIAL_LINKS: "social_links",
  /** Global keyboard shortcuts, which are not tied to one part of the page. */
  KEYBOARD: "keyboard",
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

/** How an action was triggered, sent as `method`. */
export const ANALYTICS_METHODS = {
  CLICK: "click",
  BUTTON: "button",
  SHORTCUT: "shortcut",
  COMMAND_MENU: "command_menu",
} as const;

export type AnalyticsMethod =
  (typeof ANALYTICS_METHODS)[keyof typeof ANALYTICS_METHODS];
