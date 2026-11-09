"use client";

import type { AnalyticsProperties } from "@/lib/analytics";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

/** A link inside server-rendered markdown, with click tracking. */
export function MarkdownLink({
  href,
  className,
  rel,
  target,
  eventProperties,
  children,
}: {
  href: string;
  className?: string;
  rel?: string;
  target?: string;
  eventProperties?: AnalyticsProperties;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn("link-underline text-foreground", className)}
      rel={rel}
      target={target}
      onClick={
        eventProperties
          ? () =>
              trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
                ...eventProperties,
                url: href,
              })
          : undefined
      }
    >
      {children}
    </a>
  );
}
