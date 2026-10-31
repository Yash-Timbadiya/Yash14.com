import { CAREER_EVENTS } from "@/features/cv/data/cv";
import { USER } from "@/features/portfolio/data/user";
import { CareerTicks } from "@/features/cv/components/career-ticks";
import { CareerEvents } from "@/features/cv/components/career-events";

const NOW_LABEL_BOTTOM = 160;
const NOW_LINE_HEIGHT = NOW_LABEL_BOTTOM - 6;

/** Every active event's orange bar reaches the same height: half the Now line. */
const EVENT_BAR_HEIGHT = NOW_LINE_HEIGHT / 2;

/** Tick heights in px: every month, each quarter, and each January. */
const TICK_HEIGHT = { month: 18, quarter: 28, year: 40 } as const;

const tickHeight = (month: number) =>
  month % 12 === 0
    ? TICK_HEIGHT.year
    : month % 3 === 0
      ? TICK_HEIGHT.quarter
      : TICK_HEIGHT.month;

/** Current month index (year * 12 + month) in Yash's time zone, not the server's. */
function currentMonthIndex() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: USER.timeZone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  return year * 12 + month - 1;
}

/**
 * A linear career timeline: one tick per month, a longer tick each January.
 * Everything shares one scale, so ticks, event dots, year labels and the
 * "Now" marker always line up. The range runs to the end of the current
 * year and the page revalidates daily, so "Now" advances on its own.
 */
export function CareerLine() {
  const now = currentMonthIndex();
  const startYear = Math.floor(
    Math.min(...CAREER_EVENTS.map((e) => e.month)) / 12,
  );
  const endYear = Math.floor(
    Math.max(now, ...CAREER_EVENTS.map((e) => e.month)) / 12,
  );
  const first = startYear * 12;
  const total = (endYear - startYear + 1) * 12;

  const x = (month: number) => `${((month - first) / (total - 1)) * 100}%`;

  const months = Array.from({ length: total }, (_, i) => first + i);
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  return (
    <div className="career">
      <div
        className="career-track"
        style={
          { "--event-bar": `${EVENT_BAR_HEIGHT}px` } as React.CSSProperties
        }
      >
        <CareerTicks
          ticks={months.map((month) => ({
            x: (month - first) / (total - 1),
            height: tickHeight(month),
            year: month % 12 === 0,
            future: month > now,
          }))}
        />

        <CareerEvents
          events={CAREER_EVENTS.map((event) => ({
            label: event.label,
            date: event.date,
            left: x(event.month),
            tick: event.month - first,
            tickHeight: tickHeight(event.month),
          }))}
        />

        <span className="career-mark" data-now="">
          <span
            className="career-now"
            style={{ left: x(now), height: NOW_LINE_HEIGHT }}
          />
          <span
            className="career-event serif"
            style={{ left: x(now), bottom: NOW_LABEL_BOTTOM }}
          >
            Now
          </span>
        </span>

        {years.map((year) => (
          <span
            key={year}
            className="career-year mono"
            style={{ left: x(year * 12) }}
            aria-hidden="true"
          >
            {year}
          </span>
        ))}
      </div>
    </div>
  );
}
