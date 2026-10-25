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
 * Full-width category rows: label and roast line on the left, bar and score
 * on the right. Rows with problems open to show their fixes.
 */
export function CategoryList({
  categories,
  onFixesOpened,
  className,
}: {
  categories: RoastCategory[];
  onFixesOpened?: (category: RoastCategory) => void;
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {categories.map((category) => (
        <CategoryRow
          key={category.key}
          category={category}
          onOpen={() => onFixesOpened?.(category)}
        />
      ))}
    </ul>
  );
}

function CategoryRow({
  category,
  onOpen,
}: {
  category: RoastCategory;
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
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-mono text-xs tracking-wide uppercase">
            {category.label}
          </p>
          <p className="font-serif text-base text-pretty text-muted-foreground italic">
            {category.line}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
