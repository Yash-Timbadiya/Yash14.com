"use client";

import type { RoastCheck, RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type ReportVariantProps = {
  result: RoastResult;
};

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Brand orange in brand mode, plain ink in monochrome. */
export const ACCENT_TEXT = "brand:text-[#ff4d00]";

/**
 * One scale spanning the whole track, so a fill reveals only the part of the
 * gradient its score reaches: low scores stay deep orange, full scores end in a light orange.
 */
export const SCORE_GRADIENT =
  "bg-linear-to-r from-foreground/25 to-foreground brand:from-[#b32d00] brand:via-[#ff4d00] brand:to-[#ff9a5c]";

export function scoreGradientStyle(score: number) {
  const width = Math.max(score, 1);
  return {
    width: `${width}%`,
    backgroundSize: `${10000 / width}% 100%`,
  };
}

/** Height-animated reveal for fix lists. */
export function Reveal({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          key="reveal"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function IssueFixes({
  issues,
  className,
}: {
  issues: RoastCheck[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3", className)}>
      {issues.map((issue) => (
        <li key={issue.id} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium">{issue.label}</span>
            <span
              className={cn(
                "shrink-0 font-mono text-xs",
                issue.status === "fail" ? ACCENT_TEXT : "text-muted-foreground",
              )}
            >
              {issue.status === "fail" ? "FAIL" : "WARN"} · {issue.value}
            </span>
          </div>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
            {issue.fixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
