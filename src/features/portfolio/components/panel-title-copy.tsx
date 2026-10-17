"use client";

import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { LinkIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { CopyButton } from "@/components/copy-button";
import { createHeadingUrl } from "@/components/heading";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

export function PanelTitleCopy({
  id,
  section,
  className,
  ...props
}: Omit<React.ComponentProps<typeof CopyButton>, "id" | "text"> & {
  id: string;
  section: AnalyticsSection;
}) {
  return (
    <CopyButton
      className={cn(
        "absolute top-1 ml-1 size-7 shrink-0 border-none text-muted-foreground opacity-0 transition-opacity group-hover/panel-title:opacity-100",
        className,
      )}
      variant="ghost"
      text={() => createHeadingUrl(id || "")}
      idleIcon={<LinkIcon />}
      aria-label="Copy link to section"
      onCopySuccess={() =>
        trackEvent(ANALYTICS_EVENTS.COPY_SECTION_LINK, { section, target: id })
      }
      {...props}
    />
  );
}
