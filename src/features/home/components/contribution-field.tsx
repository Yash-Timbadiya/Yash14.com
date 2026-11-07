"use client";

import type { CSSProperties } from "react";
import type { Activity } from "@/features/portfolio/types/contributions";

import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { trackEvent } from "@/lib/analytics";
import { GITHUB_USERNAME } from "@/config/site";
import { IconReload } from "@tabler/icons-react";
import { MONO_LABEL } from "@/features/home/lib/styles";
import { use, useEffect, useRef, useState } from "react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

const WEEKS = 53;
const DAYS_PER_WEEK = 7;
/** Cell pitch in CSS pixels: the minimum, grown to fill wide containers. */
const MIN_CELL = 14;
/** Space between cells. Cells start on whole pixels so their edges stay sharp. */
const GAP = 3;
/** Horizontal padding of the scroll area (px-5 on each side). */
const PADDING_X = 40;
const LEVELS = [0, 1, 2, 3, 4];

/** The accent palette for the graph; important so it beats `.contribution-levels` in globals.css. */
const FIELD_LEVELS =
  "[--level-0:color-mix(in_srgb,var(--ink)_4%,transparent)]! [--level-1:color-mix(in_srgb,var(--heat)_22%,transparent)]! [--level-2:color-mix(in_srgb,var(--heat)_46%,transparent)]! [--level-3:color-mix(in_srgb,var(--heat)_72%,transparent)]! [--level-4:var(--heat)]! [&_rect]:[rx:2px]";

type Week = (Activity | null)[];
type HoveredDay = {
  count: number;
  date: string;
  x: number;
  y: number;
  /** Viewport position of the block's top centre, for the tooltip. */
  clientX: number;
  clientY: number;
};

/** Half a typical tooltip's width, to keep it inside the viewport. */
const TOOLTIP_HALF = 96;

export function ContributionField({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hovered, setHovered] = useState<HoveredDay | null>(null);
  // Bumping this remounts the blocks, which replays their pop-in wave.
  const [replay, setReplay] = useState(0);

  const [cell, setCell] = useState(MIN_CELL);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const userScrolled = useRef(false);

  // Whole-pixel cells keep the blocks crisp; scaling the SVG to fit would put
  // their edges between pixels and blur them. Centering can still land the
  // graph on a half pixel, so it is nudged back onto the pixel grid.
  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) return;

    const settle = () => {
      setCell(fitCell(el.clientWidth));
      requestAnimationFrame(() => {
        // When the graph scrolls sideways, start at the latest weeks.
        if (!userScrolled.current) el.scrollLeft = el.scrollWidth;
        content.style.translate = "";
        const { left, top } = content.getBoundingClientRect();
        content.style.translate = `${Math.round(left) - left}px ${Math.round(top) - top}px`;
      });
    };

    const observer = new ResizeObserver(settle);
    observer.observe(el);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // A fixed tooltip would drift away from its block as the page scrolls.
  useEffect(() => {
    if (!hovered) return;
    const clear = () => setHovered(null);
    window.addEventListener("scroll", clear, { passive: true, once: true });
    return () => window.removeEventListener("scroll", clear);
  }, [hovered]);

  const weeks = toWeeks(data);
  const months = getMonthLabels(weeks);
  const total = data.reduce((sum, day) => sum + day.count, 0);

  const handlePointerOver = (event: React.PointerEvent<SVGSVGElement>) => {
    const block = event.target;
    if (!(block instanceof SVGRectElement) || !block.dataset.date) return;
    const rect = block.getBoundingClientRect();

    setHovered({
      count: Number(block.dataset.count ?? 0),
      date: block.dataset.date,
      x: Number(block.getAttribute("x")),
      y: Number(block.getAttribute("y")),
      clientX: rect.left + rect.width / 2,
      clientY: rect.top,
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Fixed to the viewport so the scroll area's edges never clip it. */}
      {hovered && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 w-max -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background"
          style={{
            left: Math.min(
              Math.max(hovered.clientX, TOOLTIP_HALF),
              window.innerWidth - TOOLTIP_HALF,
            ),
            top: hovered.clientY - 6,
          }}
        >
          {hovered.count} contribution{hovered.count === 1 ? "" : "s"} on{" "}
          {format(parseISO(hovered.date), "dd.MM.yyyy")}
        </div>
      )}
      <FieldBar>
        <span className="text-[0.8125rem] tabular-nums max-sm:hidden">
          {data.length > 0 ? total.toLocaleString("en") : "No"}{" "}
          <span className="text-ink/56">contributions</span>
        </span>
        <button
          type="button"
          aria-label="Replay the animation"
          title="Replay"
          className="grid size-7 cursor-pointer place-items-center rounded-lg border border-line text-ink/56 transition-[color,background-color] duration-150 ease-[ease] hover:bg-ink/4 hover:text-ink [&_svg]:size-3.5 [&_svg]:transition-[rotate] [&_svg]:duration-400 [&_svg]:ease-snappy hover:[&_svg]:rotate-180"
          onClick={() => {
            setHovered(null);
            setReplay((count) => count + 1);
          }}
        >
          <IconReload aria-hidden />
        </button>
      </FieldBar>

      {/* Narrow screens keep full-size cells and scroll sideways (swipe, or
          drag with a mouse) instead of shrinking them. */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex flex-1 items-center overflow-x-auto mask-[linear-gradient(to_left,transparent,black_3rem)] overscroll-x-contain py-5 pl-5 select-none"
        onScroll={() => setHovered(null)}
        onWheel={() => {
          userScrolled.current = true;
        }}
        onTouchStart={() => {
          userScrolled.current = true;
        }}
        onPointerDown={(event) => {
          userScrolled.current = true;
          const el = scrollRef.current;
          if (event.pointerType !== "mouse" || !el) return;
          if (el.scrollWidth <= el.clientWidth) return;
          drag.current = { x: event.clientX, left: el.scrollLeft };
        }}
        onPointerMove={(event) => {
          const el = scrollRef.current;
          if (!drag.current || !el) return;
          el.scrollLeft = drag.current.left - (event.clientX - drag.current.x);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
      >
        <div ref={contentRef} className="relative mx-auto shrink-0">
          <div className="relative mb-2 h-4 select-none" aria-hidden>
            {months.map(({ label, week }) => (
              <span
                key={`${label}-${week}`}
                className={cn(MONO_LABEL, "absolute top-0")}
                style={{ left: week * cell }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative">
            <FieldSvg
              key={replay}
              cell={cell}
              weeks={weeks}
              selectedLevel={selectedLevel}
              hovered={hovered}
              onPointerOver={handlePointerOver}
              onPointerLeave={() => setHovered(null)}
            />
          </div>
        </div>
        {/* Scroll areas drop their end padding; this keeps the gap after the last week. */}
        <span className="w-5 shrink-0 self-stretch" aria-hidden />
      </div>

      <div className="flex min-h-11 items-center justify-between gap-4 border-t border-line px-5 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5 max-sm:py-3">
        <p className="text-[0.8125rem] text-ink/56">
          {data.length === 0 ? (
            "Contributions are unavailable right now."
          ) : (
            <>
              <span className="sm:hidden">
                <span className="text-ink tabular-nums">
                  {total.toLocaleString("en")}
                </span>{" "}
                contributions in the past 365 days.
              </span>
              <span className="max-sm:hidden">In the past 365 days.</span>
            </>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-1 max-sm:self-end">
          <span className="mr-1 text-[0.75rem] text-ink/40 sm:hidden">
            Less
          </span>
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level}
              aria-pressed={selectedLevel === level}
              aria-label={`Highlight days with contribution level ${level}`}
              className={cn(
                "contribution-levels block cursor-pointer outline-offset-1 aria-pressed:outline-2 aria-pressed:outline-ring",
                FIELD_LEVELS,
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
                setHovered(null);
                setReplay((count) => count + 1);
              }}
            >
              <svg
                className="block"
                width={12}
                height={12}
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <rect data-level={level} width={12} height={12} />
              </svg>
            </button>
          ))}
          <span className="ml-1 text-[0.75rem] text-ink/40 sm:hidden">
            More
          </span>
        </div>
      </div>
    </div>
  );
}

function FieldBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between gap-4 border-b border-line px-5">
      <span className="truncate text-[0.8125rem] text-ink/56">
        github.com/<span className="text-foreground">{GITHUB_USERNAME}</span>
      </span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

/** Empty grid at the final size, so loading the data does not shift the page. */
export function ContributionFieldFallback() {
  return (
    <div className="flex h-full flex-col">
      <FieldBar />
      <div className="flex flex-1 items-center overflow-hidden p-5">
        <div className="mx-auto shrink-0">
          <div className="mb-2 h-4" />
          <FieldSvg
            cell={MIN_CELL}
            weeks={toWeeks([])}
            selectedLevel={null}
            hovered={null}
          />
        </div>
      </div>
      <div className="h-11 border-t border-line" />
    </div>
  );
}

function FieldSvg({
  cell,
  weeks,
  selectedLevel,
  hovered,
  onPointerOver,
  onPointerLeave,
}: {
  cell: number;
  weeks: Week[];
  selectedLevel: number | null;
  hovered: HoveredDay | null;
  onPointerOver?: React.PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: React.PointerEventHandler<SVGSVGElement>;
}) {
  const width = WEEKS * cell - GAP;
  const height = DAYS_PER_WEEK * cell - GAP;
  return (
    <svg
      className={cn("contribution-levels block overflow-visible", FIELD_LEVELS)}
      data-selected-level={selectedLevel ?? undefined}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="GitHub Contributions Graph"
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
    >
      {weeks.map((week, weekIndex) => (
        <g
          key={week.find(Boolean)?.date ?? weekIndex}
          style={{ "--week": weekIndex } as CSSProperties}
        >
          {week.map((day, dayIndex) => (
            <rect
              key={day?.date ?? dayIndex}
              x={weekIndex * cell}
              y={dayIndex * cell}
              width={cell - GAP}
              height={cell - GAP}
              className={day ? undefined : "fill-transparent"}
              data-level={day?.level}
              data-date={day?.date}
              data-count={day?.count}
            />
          ))}
        </g>
      ))}

      {hovered && (
        <rect
          className="pointer-events-none fill-transparent stroke-ink stroke-1"
          x={hovered.x - 1.5}
          y={hovered.y - 1.5}
          width={cell - GAP + 3}
          height={cell - GAP + 3}
        />
      )}
    </svg>
  );
}

/** The largest whole-pixel cell that fits the width, never below the minimum. */
function fitCell(containerWidth: number) {
  const available = containerWidth - PADDING_X + GAP;
  return Math.max(MIN_CELL, Math.floor(available / WEEKS));
}

/** The last `WEEKS` Sunday-first weeks, padded where days are missing. */
function toWeeks(data: Activity[]): Week[] {
  const weeks: Week[] = [];
  let current: Week = [];

  for (const day of data) {
    const weekday = parseISO(day.date).getDay();
    if (weekday === 0 && current.length > 0) {
      weeks.push(pad(current));
      current = [];
    }
    if (current.length === 0 && weekday > 0) {
      current = Array.from({ length: weekday }, () => null);
    }
    current.push(day);
  }
  if (current.length > 0) weeks.push(pad(current));

  const missing = Math.max(WEEKS - weeks.length, 0);
  const placeholders = Array.from({ length: missing }, () => pad([]));
  return [...placeholders, ...weeks].slice(-WEEKS);
}

function pad(week: Week): Week {
  return [
    ...week,
    ...Array.from({ length: DAYS_PER_WEEK - week.length }, () => null),
  ];
}

function getMonthLabels(weeks: Week[]) {
  const labels: { label: string; week: number }[] = [];
  let previous = "";

  weeks.forEach((week, index) => {
    const first = week.find(Boolean);
    if (!first) return;

    const label = format(parseISO(first.date), "MMM");
    // The first and last columns are too narrow to hold a label.
    if (label !== previous && index > 0 && index < WEEKS - 2) {
      labels.push({ label, week: index });
    }
    previous = label;
  });

  return labels;
}
