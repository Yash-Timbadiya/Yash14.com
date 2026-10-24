"use client";

import type { ReportVariantProps } from "./shared";
import type { RoastCategory, RoastCheck } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Reveal,
  EASE_OUT,
  toneFor,
  TONE_BAR,
  TONE_TEXT,
  ReportCta,
  IssueFixes,
  ACCENT_TEXT,
  letterGrade,
  ScannedNote,
} from "./shared";

/* Shared pieces for the scorecard family (variants 7 to 11). */

const RING_ACCENT = "stroke-foreground brand:stroke-[#ff4d00]";
// Small rings show severity: accent only when the score is bad.
const RING_TONE = {
  bad: RING_ACCENT,
  meh: "stroke-foreground/50",
  good: "stroke-foreground",
} as const;

function Ring({
  value,
  size = 128,
  stroke = 8,
  toned = false,
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  /** Colour by severity instead of the brand accent. */
  toned?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const radius = 50 - stroke / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; the value is printed inside */}
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={toned ? RING_TONE[toneFor(value)] : RING_ACCENT}
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
          transition={{ duration: 1, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function ScoreBar({ score, className }: { score: number; className?: string }) {
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
      aria-hidden
    >
      <div
        className={cn("h-full rounded-full", TONE_BAR[toneFor(score)])}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function ExpandableRow({
  category,
  trailing,
  leading,
  badge,
  onHoverChange,
  highlighted,
  defaultOpen = false,
}: {
  category: RoastCategory;
  trailing?: React.ReactNode;
  leading?: React.ReactNode;
  badge?: React.ReactNode;
  onHoverChange?: (hovered: boolean) => void;
  highlighted?: boolean;
  defaultOpen?: boolean;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const hasIssues = category.issues.length > 0;

  return (
    <li
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
      className={cn(highlighted && "bg-muted/40")}
    >
      <button
        type="button"
        disabled={!hasIssues}
        aria-expanded={hasIssues ? open : undefined}
        aria-controls={hasIssues ? contentId : undefined}
        onClick={() => setOpen(!open)}
        onFocus={() => onHoverChange?.(true)}
        onBlur={() => onHoverChange?.(false)}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40 disabled:hover:bg-transparent"
      >
        {leading}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
            {category.label}
            {badge}
          </p>
          <p className="font-serif text-base text-pretty text-muted-foreground italic">
            {category.line}
          </p>
        </div>
        {trailing}
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
            !hasIssues && "invisible",
          )}
        />
      </button>
      {hasIssues && (
        <Reveal open={open} id={contentId}>
          <IssueFixes issues={category.issues} className="px-4 pb-4" />
        </Reveal>
      )}
    </li>
  );
}

function Score({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "w-9 text-right font-mono text-lg font-semibold tabular-nums",
        TONE_TEXT[toneFor(score)],
        className,
      )}
    >
      {score}
    </span>
  );
}

function Footer(props: ReportVariantProps) {
  return (
    <>
      <div className="screen-line-bottom p-4">
        <p className="font-serif text-xl text-balance italic sm:text-2xl">
          “{props.result.verdict}”
        </p>
      </div>
      <ReportCta {...props} />
      <div className="px-4 pb-4">
        <ScannedNote result={props.result} />
      </div>
    </>
  );
}

/* Variant 7: split layout, the gauge column stays in view while you read. */
export function ScorecardSplitReport(props: ReportVariantProps) {
  const { result } = props;

  return (
    <section>
      <div className="screen-line-bottom grid md:grid-cols-[17rem_1fr]">
        <aside className="border-line p-4 md:border-r">
          <div className="space-y-4 md:sticky md:top-20">
            <Ring value={result.score} size={160} stroke={7}>
              <span className="font-mono text-5xl font-semibold tracking-tighter tabular-nums">
                {result.score}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                /100
              </span>
            </Ring>
            <div className="space-y-1">
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {result.domain}
              </p>
              <h2 className="text-2xl font-medium tracking-tight">
                {result.grade}
              </h2>
              <p className="text-sm text-muted-foreground">
                {result.gradeNote}
              </p>
            </div>
            {result.lighthouse && (
              <dl className="space-y-1.5 border-t border-line pt-4 font-mono text-xs">
                {(
                  [
                    ["Performance", result.lighthouse.performance],
                    ["Accessibility", result.lighthouse.accessibility],
                    ["Best practices", result.lighthouse.bestPractices],
                    ["SEO", result.lighthouse.seo],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3">
                    <dt className="w-28 text-muted-foreground">{label}</dt>
                    <ScoreBar score={value} className="flex-1" />
                    <dd
                      className={cn(
                        "w-7 text-right tabular-nums",
                        TONE_TEXT[toneFor(value)],
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </aside>

        <ul className="divide-y divide-line border-t border-line md:border-t-0">
          {result.categories.map((category) => (
            <ExpandableRow
              key={category.key}
              category={category}
              trailing={
                <div className="flex items-center gap-3">
                  <ScoreBar
                    score={category.score}
                    className="hidden w-20 sm:block"
                  />
                  <Score score={category.score} />
                </div>
              }
            />
          ))}
        </ul>
      </div>
      <Footer {...props} />
    </section>
  );
}

/* Variant 8: the gauge is split into one arc per category; rows light up their arc. */
export function ScorecardSegmentsReport(props: ReportVariantProps) {
  const { result } = props;
  const reduceMotion = useReducedMotion();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const count = result.categories.length;
  const gapDeg = 6;
  const sweep = 360 / count - gapDeg;
  const radius = 44;

  const arc = (startDeg: number, deg: number) => {
    const toXY = (d: number) => {
      const rad = ((d - 90) * Math.PI) / 180;
      return `${(50 + radius * Math.cos(rad)).toFixed(2)} ${(50 + radius * Math.sin(rad)).toFixed(2)}`;
    };
    return `M ${toXY(startDeg)} A ${radius} ${radius} 0 ${deg > 180 ? 1 : 0} 1 ${toXY(startDeg + deg)}`;
  };

  return (
    <section>
      <div className="screen-line-bottom grid items-center gap-6 p-4 sm:grid-cols-[auto_1fr]">
        <div className="relative size-44 shrink-0">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; every value is listed in the rows */}
          <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
            {result.categories.map((category, i) => {
              const start = i * (360 / count) + gapDeg / 2;
              const active = activeKey === null || activeKey === category.key;
              return (
                <g
                  key={category.key}
                  style={{ opacity: active ? 1 : 0.25 }}
                  className="transition-opacity"
                >
                  <path
                    d={arc(start, sweep)}
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="stroke-muted"
                  />
                  <motion.path
                    d={arc(start, sweep)}
                    fill="none"
                    strokeWidth="7"
                    strokeLinecap="round"
                    className={
                      category.score < 80 ? RING_ACCENT : "stroke-foreground"
                    }
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: category.score / 100 }}
                    transition={{
                      duration: 0.9,
                      ease: EASE_OUT,
                      delay: i * 0.06,
                    }}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-semibold tracking-tighter tabular-nums">
              {result.score}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {activeKey
                ? result.categories.find((c) => c.key === activeKey)?.label
                : "/100"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Roast report · {result.domain}
          </p>
          <h2 className="text-3xl font-medium tracking-tight">
            {result.grade}
          </h2>
          <p className="text-muted-foreground">{result.gradeNote}</p>
          <p className="font-mono text-xs text-muted-foreground">
            Each arc is one category. Hover a row to find it.
          </p>
        </div>
      </div>

      <div className="stripe-divider h-4 w-full" />

      <ul className="screen-line-top screen-line-bottom divide-y divide-line">
        {result.categories.map((category) => (
          <ExpandableRow
            key={category.key}
            category={category}
            highlighted={activeKey === category.key}
            onHoverChange={(hovered) =>
              setActiveKey(hovered ? category.key : null)
            }
            trailing={<Score score={category.score} />}
          />
        ))}
      </ul>
      <Footer {...props} />
    </section>
  );
}

/* Variant 9: Lighthouse gets its own rings; categories wear letter grades. */
export function ScorecardRingsReport(props: ReportVariantProps) {
  const { result } = props;

  return (
    <section>
      <div className="screen-line-bottom flex flex-col gap-6 p-4 sm:flex-row sm:items-center">
        <Ring value={result.score} size={136}>
          <span className="font-mono text-4xl font-semibold tracking-tighter tabular-nums">
            {result.score}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            /100
          </span>
        </Ring>
        <div className="flex-1 space-y-1">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Roast report · {result.domain}
          </p>
          <h2 className="text-3xl font-medium tracking-tight">
            {result.grade}
          </h2>
          <p className="text-muted-foreground">{result.gradeNote}</p>
        </div>
      </div>

      {result.lighthouse && (
        <div className="screen-line-bottom grid grid-cols-4">
          {(
            [
              ["Perf", result.lighthouse.performance],
              ["A11y", result.lighthouse.accessibility],
              ["Best pr.", result.lighthouse.bestPractices],
              ["SEO", result.lighthouse.seo],
            ] as const
          ).map(([label, value], i) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center gap-2 p-4",
                i > 0 && "border-l border-line",
              )}
            >
              <Ring value={value} size={64} stroke={9} toned>
                <span
                  className={cn(
                    "font-mono text-base font-semibold tabular-nums",
                    TONE_TEXT[toneFor(value)],
                  )}
                >
                  {value}
                </span>
              </Ring>
              <span className="font-mono text-[11px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="stripe-divider h-4 w-full" />

      <ul className="screen-line-top screen-line-bottom divide-y divide-line">
        {result.categories.map((category) => (
          <ExpandableRow
            key={category.key}
            category={category}
            leading={
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md border border-line font-serif text-xl font-semibold",
                  TONE_TEXT[toneFor(category.score)],
                )}
              >
                {letterGrade(category.score)}
              </span>
            }
            trailing={
              <Score
                score={category.score}
                className="text-base text-muted-foreground"
              />
            }
          />
        ))}
      </ul>
      <Footer {...props} />
    </section>
  );
}

/* Variant 10: a speedometer, then the worst category first. Passing ones fold away. */
export function ScorecardPriorityReport(props: ReportVariantProps) {
  const { result } = props;
  const reduceMotion = useReducedMotion();
  const passedId = useId();
  const [showPassed, setShowPassed] = useState(false);
  const sorted = [...result.categories].sort((a, b) => a.score - b.score);
  const needsWork = sorted.filter((c) => c.issues.length > 0);
  const passed = sorted.filter((c) => c.issues.length === 0);
  const angle = -90 + (result.score / 100) * 180;

  return (
    <section>
      <div className="screen-line-bottom flex flex-col items-center gap-2 p-6 text-center">
        <div className="relative h-28 w-56">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; the score is printed below */}
          <svg viewBox="0 0 200 110" className="size-full" aria-hidden>
            <path
              d="M 15 100 A 85 85 0 0 1 185 100"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className="stroke-muted"
            />
            <motion.path
              d="M 15 100 A 85 85 0 0 1 185 100"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              className={RING_ACCENT}
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: result.score / 100 }}
              transition={{ duration: 1, ease: EASE_OUT }}
            />
            <motion.g
              // Pivot on the needle's base (bottom centre of its own box).
              style={{ originX: 0.5, originY: 1 }}
              initial={reduceMotion ? false : { rotate: -90 }}
              animate={{ rotate: angle }}
              transition={{ type: "spring", stiffness: 60, damping: 12 }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="32"
                strokeWidth="3"
                strokeLinecap="round"
                className="stroke-foreground"
              />
            </motion.g>
            <circle cx="100" cy="100" r="6" className="fill-foreground" />
          </svg>
        </div>
        <p className="font-mono text-5xl font-semibold tracking-tighter tabular-nums">
          {result.score}
          <span className="text-sm text-muted-foreground">/100</span>
        </p>
        <h2 className="text-2xl font-medium tracking-tight">{result.grade}</h2>
        <p className="text-sm text-muted-foreground">
          {result.domain} · {result.gradeNote}
        </p>
      </div>

      <div className="stripe-divider h-4 w-full" />

      <ul className="screen-line-top screen-line-bottom divide-y divide-line">
        {needsWork.map((category, i) => (
          <ExpandableRow
            key={category.key}
            category={category}
            defaultOpen={i === 0}
            badge={
              i === 0 ? (
                <span
                  className={cn(
                    "rounded-sm border border-current px-1.5 py-px text-[10px] normal-case",
                    ACCENT_TEXT,
                  )}
                >
                  Fix first
                </span>
              ) : null
            }
            trailing={<Score score={category.score} />}
          />
        ))}
        {passed.length > 0 && (
          <li>
            <button
              type="button"
              aria-expanded={showPassed}
              aria-controls={passedId}
              onClick={() => setShowPassed(!showPassed)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left font-mono text-xs text-muted-foreground hover:bg-muted/40"
            >
              {passed.length} categories passed:{" "}
              {passed.map((c) => c.label).join(", ")}
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  showPassed && "rotate-180",
                )}
              />
            </button>
            <Reveal open={showPassed} id={passedId}>
              <ul className="divide-y divide-line border-t border-line">
                {passed.map((category) => (
                  <li
                    key={category.key}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <span className="w-32 font-mono text-xs uppercase">
                      {category.label}
                    </span>
                    <span className="flex-1 font-serif text-sm text-muted-foreground italic">
                      {category.line}
                    </span>
                    <Score score={category.score} className="text-base" />
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        )}
      </ul>
      <Footer {...props} />
    </section>
  );
}

/* Variant 11: problems are visible up front as chips; each chip opens its own fixes. */
export function ScorecardChipsReport(props: ReportVariantProps) {
  const { result } = props;

  return (
    <section>
      <div className="screen-line-bottom grid items-center gap-6 p-4 sm:grid-cols-[auto_1fr_auto]">
        <Ring value={result.score} size={112}>
          <span className="font-mono text-3xl font-semibold tracking-tighter tabular-nums">
            {result.score}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            /100
          </span>
        </Ring>
        <div className="space-y-1">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Roast report · {result.domain}
          </p>
          <h2 className="text-3xl font-medium tracking-tight">
            {result.grade}
          </h2>
          <p className="text-muted-foreground">{result.gradeNote}</p>
        </div>
        {result.lighthouse && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
            {(
              [
                ["Perf", result.lighthouse.performance],
                ["A11y", result.lighthouse.accessibility],
                ["BP", result.lighthouse.bestPractices],
                ["SEO", result.lighthouse.seo],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    TONE_TEXT[toneFor(value)],
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="stripe-divider h-4 w-full" />

      <ul className="screen-line-top screen-line-bottom divide-y divide-line">
        {result.categories.map((category) => (
          <ChipRow key={category.key} category={category} />
        ))}
      </ul>
      <Footer {...props} />
    </section>
  );
}

function ChipRow({ category }: { category: RoastCategory }) {
  const contentId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active: RoastCheck | undefined = category.issues.find(
    (i) => i.id === activeId,
  );

  return (
    <li className="space-y-3 p-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-mono text-xs tracking-wide uppercase">
            {category.label}
          </p>
          <p className="font-serif text-base text-pretty text-muted-foreground italic">
            {category.line}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBar score={category.score} className="hidden w-20 sm:block" />
          <Score score={category.score} />
        </div>
      </div>

      {category.issues.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {category.issues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              aria-expanded={activeId === issue.id}
              aria-controls={contentId}
              onClick={() =>
                setActiveId(activeId === issue.id ? null : issue.id)
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[11px] hover:bg-muted",
                issue.status === "fail"
                  ? cn("border-current", ACCENT_TEXT)
                  : "border-line text-muted-foreground",
                activeId === issue.id && "bg-muted",
              )}
            >
              {issue.label} · {issue.value}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          All {category.passedCount} checks passed.
        </p>
      )}

      <Reveal open={Boolean(active)} id={contentId}>
        {active && (
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
            {active.fixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ul>
        )}
      </Reveal>
    </li>
  );
}
