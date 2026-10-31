import { CAREER_EVENTS } from "@/features/cv/data/cv";
import { USER } from "@/features/portfolio/data/user";
import { CareerEvents } from "@/features/cv/components/career-events";

const NOW_LABEL_BOTTOM = 160;

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
      <div className="career-track">
        {/* One SVG with crisp edges: every tick snaps to a whole pixel, so
            all of them render at the same 1px width and brightness. */}
        <svg
          className="career-ticks"
          viewBox={`0 0 ${total - 1} ${TICK_HEIGHT.year}`}
          preserveAspectRatio="none"
          style={{ height: TICK_HEIGHT.year }}
          aria-hidden="true"
        >
          {months.map((month) => {
            const height = tickHeight(month);
            return (
              <line
                key={month}
                x1={month - first}
                x2={month - first}
                y1={TICK_HEIGHT.year - height}
                y2={TICK_HEIGHT.year}
                data-year={month % 12 === 0 ? "" : undefined}
                data-future={month > now ? "" : undefined}
              />
            );
          })}
        </svg>

        <CareerEvents
          events={CAREER_EVENTS.map((event) => ({
            label: event.label,
            date: event.date,
            left: x(event.month),
            tickHeight: tickHeight(event.month),
          }))}
        />

        <span className="career-mark" data-now="">
          <span
            className="career-now"
            style={{ left: x(now), height: NOW_LABEL_BOTTOM - 6 }}
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
