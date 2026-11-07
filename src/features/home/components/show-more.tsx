"use client";

import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { DisclosureChevron } from "./hover-arrow";
import { LINK } from "@/features/home/lib/styles";
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
    <CollapsibleTrigger
      className={cn(
        LINK,
        "mt-3 text-[0.875rem] outline-none focus-visible:underline",
      )}
    >
      {open ? "Show less" : label}
      <DisclosureChevron />
    </CollapsibleTrigger>
  );
}
