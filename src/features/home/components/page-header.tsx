import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { ChevronRight } from "./hover-arrow";
import { SectionHead } from "./section-intro";
import { TrackedLink } from "@/components/tracked-link";
import { BAND, FRAME, GAP, MONO_LABEL } from "@/features/home/lib/styles";
import { ANALYTICS_EVENTS, ANALYTICS_SOURCES } from "@/lib/analytics-events";

/**
 * The top of a subpage: a gap, a toolbar row (back home on the left, page
 * actions on the right) and the centred heading with ASCII art behind it.
 */
export function PageHeader({
  section,
  icon,
  label,
  title,
  description,
  seed,
  actions,
  children,
}: {
  /** Analytics section the page reports under. */
  section: AnalyticsSection;
  icon: React.ReactNode;
  label: string;
  title: React.ReactNode;
  description: React.ReactNode;
  seed: number;
  /** Buttons for the right side of the toolbar, such as copy and share. */
  actions?: React.ReactNode;
  /** Extra content under the description. */
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className={BAND}>
        <div className={cn(FRAME, GAP)} />
      </div>

      <div className={BAND}>
        <div
          className={cn(
            FRAME,
            "flex h-14 items-center justify-between gap-3 px-4 lg:px-6",
          )}
        >
          <span
            className="absolute top-1/2 -left-px h-6 w-0.5 -translate-y-1/2 bg-heat"
            aria-hidden
          />
          <TrackedLink
            href="/"
            className={cn(
              MONO_LABEL,
              "group/back inline-flex items-center gap-2 uppercase transition-colors hover:text-ink",
            )}
            event={ANALYTICS_EVENTS.VIEW_HOME}
            eventProperties={{ section, source: ANALYTICS_SOURCES.TOOLBAR }}
          >
            <ChevronRight className="h-2.5 w-1.5 rotate-180 transition-transform duration-200 ease-snappy group-hover/back:-translate-x-0.5" />
            Home
          </TrackedLink>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      <SectionHead
        as="h1"
        seed={seed}
        icon={icon}
        label={label}
        title={title}
        description={description}
      >
        {children}
      </SectionHead>
    </>
  );
}
