"use client";

import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics-events";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = React.ComponentProps<"a"> & {
  href: string;
  event: AnalyticsEvent;
  eventProperties: AnalyticsProperties;
};

/**
 * A link that sends an analytics event when clicked, for server components
 * that cannot pass an onClick handler. Downloads render a plain `<a>` so Next
 * does not try to prefetch the file as a route.
 */
export function TrackedLink({
  href,
  event,
  eventProperties,
  onClick,
  download,
  ...props
}: TrackedLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent(event, eventProperties);
    onClick?.(e);
  };

  if (download !== undefined) {
    return (
      <a href={href} download={download} onClick={handleClick} {...props} />
    );
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
