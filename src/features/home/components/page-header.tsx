import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { ChevronRight } from "./hover-arrow";
import { SectionHead } from "./section-intro";
import { TrackedLink } from "@/components/tracked-link";
import { BAND, FRAME } from "@/features/home/lib/styles";
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
      {/* No top rule: the sticky header's bottom border already draws it. */}
      <div className="relative">
        {/* A slim decorative strip under the site header: two blank "fields"
            sketched in hairlines, in place of the full section gap. */}
        <div className={cn(FRAME, "grid h-9 sm:grid-cols-2")} aria-hidden>
          {["start", "end"].map((half) => (
            <div
              key={half}
              className="flex items-center gap-3 px-2 not-first:border-l not-first:border-hairline max-sm:not-first:hidden sm:gap-4"
            >
              <span className="h-3.5 flex-1 rounded-[5px] border border-hairline" />
              <span className="size-4.5 shrink-0 rounded-full border border-hairline" />
              <span className="h-3.5 flex-1 rounded-[5px] border border-hairline" />
            </div>
          ))}
        </div>
      </div>

      <div className={BAND}>
        <div
          className={cn(
            FRAME,
            "flex h-14 items-center justify-between gap-3 px-2.5 lg:px-4",
          )}
        >
          <span
            className="absolute top-1/2 -left-px h-6 w-0.5 -translate-y-1/2 bg-heat"
            aria-hidden
          />
          <TrackedLink
            href="/"
            className="group/back inline-flex h-9 items-center gap-2.5 rounded-[0.625rem] px-3 text-[0.9375rem] font-medium text-ink/72 transition-colors duration-150 hover:bg-ink/4 hover:text-ink"
            event={ANALYTICS_EVENTS.VIEW_HOME}
            eventProperties={{ section, source: ANALYTICS_SOURCES.TOOLBAR }}
          >
            <ChevronRight className="h-3 w-2 rotate-180 transition-transform duration-200 ease-snappy group-hover/back:-translate-x-0.5" />
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
