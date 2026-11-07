"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { YTMark } from "@/components/yt-mark";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function SiteHeaderLogo() {
  return (
    <Link
      href="/"
      aria-label="Home"
      onClick={() =>
        trackEvent(ANALYTICS_EVENTS.LOGO_CLICK, {
          section: ANALYTICS_SECTIONS.HEADER,
        })
      }
    >
      <YTMark className="h-8 shrink-0" />
    </Link>
  );
}
