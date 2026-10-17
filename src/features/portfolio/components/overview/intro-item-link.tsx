"use client";

import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

export function IntroItemLink({
  className,
  href,
  event,
  eventProperties,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  /** Sent when the link is clicked. Props stay serializable for server use. */
  event?: AnalyticsEvent;
  eventProperties?: AnalyticsProperties;
}) {
  return (
    <a
      href={href}
      className={cn("link", className)}
      target="_blank"
      rel="noopener"
      onClick={(e) => {
        if (event && eventProperties) {
          trackEvent(event, eventProperties);
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
