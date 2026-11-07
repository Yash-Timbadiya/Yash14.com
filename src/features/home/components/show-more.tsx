"use client";

import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics-events";

import { DisclosureChevron } from "./hover-arrow";
import { CollapsibleTrigger } from "@/components/base/ui/collapsible";
import {
  Collapsible,
  CollapsibleMotionContent,
  useCollapsible,
} from "@/components/base/collapsible-animated";

export function ShowMore({
  label,
  openEvent,
  closeEvent,
  eventProperties,
  children,
}: {
  label: string;
  openEvent: AnalyticsEvent;
  closeEvent: AnalyticsEvent;
  eventProperties: AnalyticsProperties;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      openEvent={openEvent}
      closeEvent={closeEvent}
      eventProperties={eventProperties}
    >
      <CollapsibleMotionContent>{children}</CollapsibleMotionContent>
      <ShowMoreTrigger label={label} />
    </Collapsible>
  );
}

function ShowMoreTrigger({ label }: { label: string }) {
  const { open } = useCollapsible();

  return (
    <CollapsibleTrigger className="home-link group mt-3 outline-none focus-visible:underline">
      {open ? "Show less" : label}
      <DisclosureChevron />
    </CollapsibleTrigger>
  );
}
