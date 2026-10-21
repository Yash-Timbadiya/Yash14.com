"use client";

import type { Activity } from "@/features/portfolio/components/contribution-graph";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { use, useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/features/portfolio/components/contribution-graph";

type HoveredDay = {
  count: number;
  date: string;
  /** Center-top of the block, relative to the graph container. */
  x: number;
  y: number;
};

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hovered, setHovered] = useState<HoveredDay | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // One delegated listener and one tooltip for all ~365 blocks; a tooltip per
  // block made hydration and interaction noticeably slow.
  const handlePointerOver = (event: React.PointerEvent) => {
    const block = event.target;
    const container = containerRef.current;
    if (
      !(block instanceof SVGRectElement) ||
      !block.dataset.date ||
      !container
    ) {
      return;
    }

    const blockRect = block.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setHovered({
      count: Number(block.dataset.count ?? 0),
      date: block.dataset.date,
      x: blockRect.left - containerRect.left + blockRect.width / 2,
      y: blockRect.top - containerRect.top,
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <ContributionGraph
        className="contribution-levels mx-auto gap-4 py-4"
        data-selected-level={selectedLevel ?? undefined}
        data={data}
        blockSize={12}
        blockMargin={2}
        blockRadius={0}
        aria-label="GitHub Contributions Graph"
      >
        <ContributionGraphCalendar
          key={selectedLevel ?? "all"}
          className="px-4 **:data-[slot=month-labels]:text-muted-foreground"
          aria-hidden
          onPointerOver={handlePointerOver}
          onPointerLeave={() => setHovered(null)}
          onScroll={() => setHovered(null)}
        >
          {({ activity, dayIndex, weekIndex }) => (
            // Colors and animation come from `.contribution-levels` in globals.css.
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
              theme=""
            />
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
                      {
                        section: ANALYTICS_SECTIONS.GITHUB_CONTRIBUTIONS,
                        level,
                      },
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
                    <rect data-level={level} height={12} width={12} />
                  </svg>
                </button>
              )}
            </ContributionGraphLegend>
          </div>
        </ContributionGraphFooter>
      </ContributionGraph>

      {hovered && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 w-max -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-4 py-2 font-sans text-sm text-background animate-in fade-in-0 zoom-in-95"
          style={{ left: hovered.x, top: hovered.y - 8 }}
        >
          {hovered.count} contribution{hovered.count === 1 ? "" : "s"} on{" "}
          {format(new Date(hovered.date), "dd.MM.yyyy")}
          <span
            className="absolute top-full left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs bg-foreground"
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-45 w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
