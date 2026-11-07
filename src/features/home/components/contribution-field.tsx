"use client";

import type { CSSProperties } from "react";
import type { Activity } from "@/features/portfolio/components/contribution-graph";

import { use, useState } from "react";
import { format, parseISO } from "date-fns";
import { trackEvent } from "@/lib/analytics";
import { GITHUB_USERNAME } from "@/config/site";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

const WEEKS = 53;
const DAYS_PER_WEEK = 7;
const CELL = 10;
const INSET = 1;
const LEVELS = [0, 1, 2, 3, 4];

type Week = (Activity | null)[];
type HoveredDay = { count: number; date: string; x: number; y: number };

export function ContributionField({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hovered, setHovered] = useState<HoveredDay | null>(null);

  const weeks = toWeeks(data);
  const months = getMonthLabels(weeks);
  const total = data.reduce((sum, day) => sum + day.count, 0);

  const handlePointerOver = (event: React.PointerEvent<SVGSVGElement>) => {
    const block = event.target;
    if (!(block instanceof SVGRectElement) || !block.dataset.date) return;

    setHovered({
      count: Number(block.dataset.count ?? 0),
      date: block.dataset.date,
      x: Number(block.getAttribute("x")) - INSET,
      y: Number(block.getAttribute("y")) - INSET,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <FieldBar>
        <span className="text-[0.8125rem] tabular-nums">
          {data.length > 0 ? total.toLocaleString("en") : "No"}{" "}
          <span className="text-(color:--ink-56)">contributions</span>
        </span>
      </FieldBar>

      {/* Narrow screens crop to the most recent weeks instead of shrinking cells. */}
      <div className="flex flex-1 items-center justify-end overflow-hidden px-5 py-5">
        <div className="relative w-full min-w-3xl shrink-0">
          <div className="relative mb-2 h-4 select-none" aria-hidden>
            {months.map(({ label, week }) => (
              <span
                key={`${label}-${week}`}
                className="home-mono-label absolute top-0"
                style={{ left: `${(week / WEEKS) * 100}%` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative">
            <FieldSvg
              weeks={weeks}
              selectedLevel={selectedLevel}
              hovered={hovered}
              onPointerOver={handlePointerOver}
              onPointerLeave={() => setHovered(null)}
            />

            {hovered && (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-20 w-max -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background"
                style={{
                  left: `${((hovered.x + CELL / 2) / (WEEKS * CELL)) * 100}%`,
                  top: `calc(${(hovered.y / (DAYS_PER_WEEK * CELL)) * 100}% - 6px)`,
                }}
              >
                {hovered.count} contribution{hovered.count === 1 ? "" : "s"} on{" "}
                {format(parseISO(hovered.date), "dd.MM.yyyy")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-11 items-center justify-between gap-4 border-t border-line px-5">
        <p className="text-[0.8125rem] text-(color:--ink-56)">
          {data.length > 0
            ? "In the past 365 days."
            : "Contributions are unavailable right now."}
        </p>
        <div className="flex items-center gap-1">
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level}
              aria-pressed={selectedLevel === level}
              aria-label={`Highlight days with contribution level ${level}`}
              className="contribution-levels home-field block cursor-pointer outline-offset-1 aria-pressed:outline-2 aria-pressed:outline-ring"
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
        </div>
      </div>
    </div>
  );
}

function FieldBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between gap-4 border-b border-line px-5">
      <span className="truncate text-[0.8125rem] text-(color:--ink-56)">
        github.com/<span className="text-foreground">{GITHUB_USERNAME}</span>
      </span>
      {children}
    </div>
  );
}

/** Empty grid at the final size, so loading the data does not shift the page. */
export function ContributionFieldFallback() {
  return (
    <div className="flex h-full flex-col">
      <FieldBar />
      <div className="flex flex-1 items-center justify-end overflow-hidden p-5">
        <div className="w-full min-w-3xl shrink-0">
          <div className="mb-2 h-4" />
          <FieldSvg weeks={toWeeks([])} selectedLevel={null} hovered={null} />
        </div>
      </div>
      <div className="h-11 border-t border-line" />
    </div>
  );
}

function FieldSvg({
  weeks,
  selectedLevel,
  hovered,
  onPointerOver,
  onPointerLeave,
}: {
  weeks: Week[];
  selectedLevel: number | null;
  hovered: HoveredDay | null;
  onPointerOver?: React.PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: React.PointerEventHandler<SVGSVGElement>;
}) {
  return (
    <svg
      className="contribution-levels home-field block h-auto w-full overflow-visible"
      data-selected-level={selectedLevel ?? undefined}
      viewBox={`0 0 ${WEEKS * CELL} ${DAYS_PER_WEEK * CELL}`}
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
              x={weekIndex * CELL + INSET}
              y={dayIndex * CELL + INSET}
              width={CELL - INSET * 2}
              height={CELL - INSET * 2}
              className={day ? undefined : "home-field-empty"}
              data-level={day?.level}
              data-date={day?.date}
              data-count={day?.count}
            />
          ))}
        </g>
      ))}

      {hovered && (
        <rect
          className="home-field-cursor"
          x={hovered.x}
          y={hovered.y}
          width={CELL}
          height={CELL}
        />
      )}
    </svg>
  );
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
