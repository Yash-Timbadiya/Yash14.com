"use client";

import type { RoastCategory } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  Reveal,
  IssueFixes,
  ACCENT_TEXT,
  SCORE_GRADIENT,
  scoreGradientStyle,
} from "@/features/roast/components/report-variants/shared";

/**
 * `bar` puts a score bar and number beside the line. `watermark` gives the
 * line the full width and prints the score huge and faded behind the row.
 */
export type CategoryScoreStyle = "bar" | "watermark";

/**
 * Full-width category rows: label and roast line on the left, the score on
 * the right. Rows with problems open to show their fixes.
 */
export function CategoryList({
  categories,
  onFixesOpened,
  scoreStyle = "bar",
  className,
}: {
  categories: RoastCategory[];
  onFixesOpened?: (category: RoastCategory) => void;
  scoreStyle?: CategoryScoreStyle;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {categories.map((category) => (
        <CategoryRow
          key={category.key}
          category={category}
          scoreStyle={scoreStyle}
          onOpen={() => onFixesOpened?.(category)}
        />
      ))}
    </ul>
  );
}

function CategoryRow({
  category,
  scoreStyle,
  onOpen,
}: {
  category: RoastCategory;
  scoreStyle: CategoryScoreStyle;
  onOpen: () => void;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const hasIssues = category.issues.length > 0;

  return (
    <li>
      <button
        type="button"
        disabled={!hasIssues}
        aria-expanded={hasIssues ? open : undefined}
        aria-controls={hasIssues ? contentId : undefined}
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
        className={cn(
          "flex w-full items-center gap-4 border-b-2 border-dashed border-transparent p-4 text-left hover:bg-muted/40 disabled:hover:bg-transparent",
          open && "border-line",
          scoreStyle === "watermark" && "relative isolate overflow-hidden",
        )}
      >
        {scoreStyle === "watermark" && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-2 right-2 -z-10 font-sans text-3xl leading-none font-bold tracking-tighter tabular-nums opacity-20 select-none sm:text-5xl",
              ACCENT_TEXT,
            )}
          >
            {category.score}
          </span>
        )}
        <div
          className={cn(
            "min-w-0 flex-1 space-y-1",
            // Keeps the text clear of the score; the chevron covers the rest of its width.
            scoreStyle === "watermark" && "pr-0 sm:pr-22",
          )}
        >
          <p className="flex items-center gap-1.5 font-mono text-xs tracking-wide uppercase">
            {category.label}
            {category.aiScored && (
              <span
                title="Scored by the AI from the page, not by a measured check"
                className="rounded-sm border border-line px-1 py-px text-[10px] leading-none tracking-normal text-muted-foreground normal-case"
              >
                AI score
              </span>
            )}
            {scoreStyle === "watermark" && (
              <>
                <span className="sr-only">
                  , scored {category.score} of 100
                </span>
                {/* Beside the heading, since the score holds the right edge. */}
                {hasIssues && <RowChevron open={open} />}
              </>
            )}
          </p>
          <p className="font-serif text-base text-pretty text-muted-foreground italic">
            {category.line}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-3",
            scoreStyle === "watermark" && "hidden",
          )}
        >
          <div
            aria-hidden
            className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block"
          >
            <div
              className={cn("h-full rounded-full", SCORE_GRADIENT)}
              style={scoreGradientStyle(category.score)}
            />
          </div>
          <span
            className={cn(
              "w-9 text-right font-mono text-lg font-semibold tabular-nums",
              ACCENT_TEXT,
            )}
          >
            {category.score}
          </span>
        </div>
        {scoreStyle === "bar" && (
          <RowChevron open={open} className={cn(!hasIssues && "invisible")} />
        )}
      </button>
      {hasIssues && (
        <Reveal open={open} id={contentId}>
          <div className="p-4">
            <IssueFixes issues={category.issues} />
            {category.passedCount > 0 && (
              <p className="pt-3 font-mono text-xs text-muted-foreground">
                {category.passedCount} other check
                {category.passedCount === 1 ? "" : "s"} passed.
              </p>
            )}
          </div>
        </Reveal>
      )}
    </li>
  );
}

function RowChevron({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <ChevronDownIcon
      className={cn(
        "size-4 shrink-0 text-muted-foreground transition-transform",
        open && "rotate-180",
        className,
      )}
    />
  );
}
