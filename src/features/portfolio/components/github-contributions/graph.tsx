"use client";

import type { Activity } from "@/features/portfolio/components/contribution-graph";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { use, useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
  GITHUB_THEME,
} from "@/features/portfolio/components/contribution-graph";

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLevel === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!legendRef.current?.contains(event.target as Node)) {
        setSelectedLevel(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selectedLevel]);

  return (
    <ContributionGraph
      className="mx-auto gap-4 py-4"
      data={data}
      blockSize={12}
      blockMargin={2}
      blockRadius={0}
      aria-label="GitHub Contributions Graph"
    >
      <ContributionGraphCalendar
        key={selectedLevel ?? "all"}
        className="px-4 **:data-[slot=month-labels]:text-muted-foreground"
        title="GitHub Contributions"
        aria-hidden
      >
        {({ activity, dayIndex, weekIndex }) => (
          <Tooltip>
            <TooltipTrigger
              render={
                <g>
                  <ContributionGraphBlock
                    activity={activity}
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                    theme={GITHUB_THEME}
                    className={cn(
                      "origin-center transform-fill transition-opacity motion-safe:animate-contribution-in",
                      selectedLevel !== null &&
                        activity.level !== selectedLevel &&
                        "opacity-15",
                    )}
                    style={{
                      animationDelay: `${(weekIndex + dayIndex) * 20}ms`,
                    }}
                  />
                </g>
              }
            />
            <TooltipContent className="font-sans">
              <p>
                {activity.count} contribution{activity.count > 1 ? "s" : null}{" "}
                on {format(new Date(activity.date), "dd.MM.yyyy")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>

      <ContributionGraphFooter className="gap-4 px-4 leading-none">
        <ContributionGraphTotalCount>
          {({ totalCount }) => (
            <div className="text-muted-foreground">
              {totalCount.toLocaleString("en")} contributions in the past 365
              days.
            </div>
          )}
        </ContributionGraphTotalCount>

        <div ref={legendRef} className="ml-auto">
          <ContributionGraphLegend>
            {({ level }) => (
              <button
                type="button"
                key={`legend-${level}`}
                aria-pressed={selectedLevel === level}
                aria-label={`Highlight days with contribution level ${level}`}
                className={cn(
                  "block cursor-pointer",
                  selectedLevel === level &&
                    "outline-2 outline-offset-1 outline-ring",
                )}
                onClick={() => {
                  trackEvent(
                    selectedLevel === level
                      ? ANALYTICS_EVENTS.CONTRIBUTION_LEVEL_CLEARED
                      : ANALYTICS_EVENTS.CONTRIBUTION_LEVEL_SELECTED,
                    { section: ANALYTICS_SECTIONS.GITHUB_CONTRIBUTIONS, level },
                  );
                  setSelectedLevel((current) =>
                    current === level ? null : level,
                  );
                }}
              >
                <svg
                  aria-hidden="true"
                  className="block"
                  height={12}
                  width={12}
                >
                  <rect
                    className={GITHUB_THEME}
                    data-level={level}
                    height={12}
                    width={12}
                  />
                </svg>
              </button>
            )}
          </ContributionGraphLegend>
        </div>
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-45 w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
