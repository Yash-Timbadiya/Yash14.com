"use client";

import type { ReportVariantProps } from "./shared";
import type { RoastCategory } from "@/features/roast/types";

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
  ScannedNote,
} from "./shared";

/** Variant 1: a gauge up top, categories as a compact expandable table. */
export function ScorecardReport({
  result,
  onRoastAnother,
}: ReportVariantProps) {
  return (
    <section>
      <div className="screen-line-bottom grid items-center gap-6 p-4 sm:grid-cols-[auto_1fr]">
        <ScoreGauge score={result.score} />
        <div className="space-y-2">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Roast report · {result.domain}
          </p>
          <h2 className="text-3xl font-medium tracking-tight">
            {result.grade}
          </h2>
          <p className="text-muted-foreground">{result.gradeNote}</p>
          {result.lighthouse && (
            <p className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono text-xs text-muted-foreground">
              <span>
                Perf{" "}
                <b
                  className={cn(
                    "font-semibold",
                    TONE_TEXT[toneFor(result.lighthouse.performance)],
                  )}
                >
                  {result.lighthouse.performance}
                </b>
              </span>
              <span>
                A11y{" "}
                <b className="font-semibold text-foreground">
                  {result.lighthouse.accessibility}
                </b>
              </span>
              <span>
                Best practices{" "}
                <b className="font-semibold text-foreground">
                  {result.lighthouse.bestPractices}
                </b>
              </span>
              <span>
                SEO{" "}
                <b className="font-semibold text-foreground">
                  {result.lighthouse.seo}
                </b>
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="stripe-divider h-4 w-full" />

      <ul className="screen-line-top screen-line-bottom divide-y divide-line">
        {result.categories.map((category) => (
          <CategoryRow key={category.key} category={category} />
        ))}
      </ul>

      <div className="screen-line-bottom p-4">
        <p className="font-serif text-xl text-balance italic sm:text-2xl">
          “{result.verdict}”
        </p>
      </div>

      <ReportCta result={result} onRoastAnother={onRoastAnother} />
      <div className="px-4 pb-4">
        <ScannedNote result={result} />
      </div>
    </section>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const reduceMotion = useReducedMotion();
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative size-32 shrink-0">
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative; the score is printed beside it */}
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-foreground brand:stroke-[#ff4d00]"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold tracking-tighter tabular-nums">
          {score}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          /100
        </span>
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: RoastCategory }) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const tone = toneFor(category.score);
  const hasIssues = category.issues.length > 0;

  return (
    <li>
      <button
        type="button"
        disabled={!hasIssues}
        aria-expanded={hasIssues ? open : undefined}
        aria-controls={hasIssues ? contentId : undefined}
        onClick={() => setOpen(!open)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left hover:bg-muted/40 disabled:hover:bg-transparent"
      >
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-xs tracking-wide uppercase">
            {category.label}
          </p>
          <p className="font-serif text-base text-pretty text-muted-foreground italic">
            {category.line}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block"
            aria-hidden
          >
            <div
              className={cn("h-full rounded-full", TONE_BAR[tone])}
              style={{ width: `${category.score}%` }}
            />
          </div>
          <span
            className={cn(
              "w-8 text-right font-mono text-lg font-semibold tabular-nums",
              TONE_TEXT[tone],
            )}
          >
            {category.score}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
              !hasIssues && "invisible",
            )}
          />
        </div>
      </button>
      {hasIssues && (
        <Reveal open={open} id={contentId}>
          <IssueFixes issues={category.issues} className="px-4 pb-4" />
        </Reveal>
      )}
    </li>
  );
}
