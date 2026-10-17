import type { AnalyticsEvent } from "@/lib/analytics-events";
import type { SocialProfile } from "@/features/portfolio/types/social-links";

import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

/**
 * Keyed registry of social profiles — the single source of truth. Icons are
 * bound separately in `social-link-icons.tsx` (keyed by the same `SocialName`),
 * so adding a profile here forces the icon map to stay in sync at compile time.
 */
export const SOCIAL = {
  x: {
    title: "X",
    handle: "@Yash_1434_",
    href: "https://x.com/Yash_1434_",
    sameAs: true,
  },
  github: {
    title: "GitHub",
    handle: "Yash-Timbadiya",
    href: "https://github.com/Yash-Timbadiya",
    sameAs: true,
  },
  linkedin: {
    title: "LinkedIn",
    handle: "Yash Timbadiya",
    href: "https://www.linkedin.com/in/yash-timbadiya-51a972249",
    sameAs: true,
  },
} satisfies Record<string, SocialProfile>;

export type SocialName = keyof typeof SOCIAL;

/**
 * Event sent when a profile link is opened. Keyed like `SOCIAL`, so adding a
 * profile fails to compile until it has an event here.
 */
export const SOCIAL_REDIRECT_EVENTS = {
  x: ANALYTICS_EVENTS.REDIRECT_TO_X,
  github: ANALYTICS_EVENTS.REDIRECT_TO_GITHUB,
  linkedin: ANALYTICS_EVENTS.REDIRECT_TO_LINKEDIN,
} satisfies Record<SocialName, AnalyticsEvent>;

export type SocialLink = SocialProfile & { name: SocialName };

export const SOCIAL_LINKS: SocialLink[] = (
  Object.entries(SOCIAL) as [SocialName, SocialProfile][]
).map(([name, profile]) => ({ name, ...profile }));
