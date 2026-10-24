"use client";

import type { ReportVariantProps } from "./shared";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  EASE_OUT,
  toneFor,
  TONE_TEXT,
  ReportCta,
  IssueFixes,
  ACCENT_TEXT,
  ScannedNote,
} from "./shared";

/** Variant 6: a heatmap. Tiles glow hotter the worse they did; pick one to read the roast. */
export function HeatTilesReport({
  result,
  onRoastAnother,
}: ReportVariantProps) {
  const reduceMotion = useReducedMotion();
  const worst = [...result.categories].sort((a, b) => a.score - b.score)[0];
  const [selectedKey, setSelectedKey] = useState(worst?.key);
  const selected =
    result.categories.find((c) => c.key === selectedKey) ?? worst;

  return (
    <section>
      <div className="screen-line-bottom flex flex-wrap items-end justify-between gap-4 p-4">
        <div>
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Heat check · {result.domain}
          </p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight">
            {result.grade}
            <span className="text-muted-foreground"> — {result.gradeNote}</span>
          </h2>
        </div>
        <p className="font-mono text-5xl font-semibold tracking-tighter tabular-nums">
          {result.score}
          <span className="text-sm text-muted-foreground">/100</span>
        </p>
      </div>

      {/* A 1px gap over the line color draws the grid lines between tiles. */}
      <div
        className="screen-line-bottom grid grid-cols-2 gap-px bg-line sm:grid-cols-3"
        role="tablist"
        aria-label="Categories"
      >
        {result.categories.map((category) => {
          const heat = (100 - category.score) / 100;
          const active = category.key === selected?.key;
          return (
            <button
              key={category.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedKey(category.key)}
              className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden bg-background p-4 text-left sm:aspect-[5/3]"
            >
              {/* Heat: brand orange in brand mode, ink in monochrome. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-foreground brand:bg-[#ff4d00]"
                style={{ opacity: heat * 0.45 }}
              />
              {active && (
                <motion.span
                  layoutId="heat-tile-active"
                  aria-hidden
                  className="absolute inset-0 ring-2 ring-foreground ring-inset"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 480, damping: 38 }
                  }
                />
              )}
              <span className="relative font-mono text-xs tracking-wide uppercase">
                {category.label}
              </span>
              <span className="relative font-mono text-4xl font-semibold tracking-tighter tabular-nums sm:text-5xl">
                {category.score}
              </span>
            </button>
          );
        })}
      </div>

      <div className="screen-line-bottom min-h-40 p-4" role="tabpanel">
        <AnimatePresence mode="wait" initial={false}>
          {selected && (
            <motion.div
              key={selected.key}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="space-y-3"
            >
              <p className="flex items-baseline gap-2 font-mono text-xs tracking-wide uppercase">
                {selected.label}
                <span className={TONE_TEXT[toneFor(selected.score)]}>
                  {selected.score}/100
                </span>
              </p>
              <p className="font-serif text-xl text-pretty italic sm:text-2xl">
                {selected.line}
              </p>
              {selected.issues.length > 0 ? (
                <IssueFixes issues={selected.issues} className="pt-1" />
              ) : (
                <p className="font-mono text-xs text-muted-foreground">
                  All {selected.passedCount} checks passed. Nothing to fix here.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="screen-line-bottom grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <p className="font-serif text-lg text-balance italic">
          “{result.verdict}”
        </p>
        {result.lighthouse && (
          <p className="font-mono text-xs whitespace-nowrap text-muted-foreground">
            Lighthouse{" "}
            <span className={ACCENT_TEXT}>{result.lighthouse.performance}</span>{" "}
            · {result.lighthouse.accessibility} ·{" "}
            {result.lighthouse.bestPractices} · {result.lighthouse.seo}
          </p>
        )}
      </div>

      <ReportCta result={result} onRoastAnother={onRoastAnother} />
      <div className="px-4 pb-4">
        <ScannedNote result={result} />
      </div>
    </section>
  );
}
