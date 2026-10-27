"use client";

import type { ReportVariantProps } from "./shared";
import type { RoastCategory } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { Separator } from "@/components/section-separator";
import { Reveal, toneFor, TONE_TEXT, IssueFixes } from "./shared";
import { ClimateScoreDial, LighthouseKnobs } from "./editorial-gauges";
import { FinalVerdict } from "@/features/roast/components/final-verdict";

/**
 * A magazine feature: the grade is the headline beside the score dial,
 * categories are numbered sections, and the verdict closes it as a quote.
 */
export function EditorialReport({ result }: ReportVariantProps) {
  return (
    <section>
      <header className="screen-line-bottom grid items-center gap-6 p-4 sm:grid-cols-[1fr_14rem] sm:p-6">
        <div className="space-y-2">
          <h3 className="font-serif text-3xl leading-tight text-balance sm:text-4xl">
            {result.grade}
          </h3>
          <p className="text-muted-foreground">{result.gradeNote}</p>
        </div>
        <ClimateScoreDial
          result={result}
          className="justify-self-center max-sm:order-first"
        />
      </header>

      <LighthouseKnobs
        result={result}
        className="screen-line-bottom divide-line sm:grid-cols-4 sm:divide-x"
      />

      <Separator className="screen-line-bottom border-x-0" />

      <ol className="screen-line-bottom divide-y divide-line">
        {result.categories.map((category, i) => (
          <EditorialSection
            key={category.key}
            category={category}
            index={i + 1}
          />
        ))}
      </ol>

      <Separator className="screen-line-bottom border-x-0" />

      <div className="screen-line-bottom">
        <FinalVerdict result={result} />
      </div>
    </section>
  );
}

function EditorialSection({
  category,
  index,
}: {
  category: RoastCategory;
  index: number;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(false);

  return (
    <li className="grid gap-3 p-4 sm:grid-cols-[9rem_1fr] sm:gap-6 sm:p-6">
      <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
        <span className="font-mono text-xs text-muted-foreground">
          {String(index).padStart(2, "0")}
        </span>
        <span className="font-medium">{category.label}</span>
        <span
          className={cn(
            "ml-auto font-serif text-3xl sm:ml-0",
            TONE_TEXT[toneFor(category.score)],
          )}
        >
          {category.score}
        </span>
      </div>
      <div>
        <p className="font-serif text-xl leading-snug text-pretty sm:text-2xl">
          {category.line}
        </p>
        {category.issues.length > 0 ? (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen(!open)}
              className="mt-3 font-mono text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              {open
                ? "Hide footnotes"
                : `${category.issues.length} footnote${category.issues.length === 1 ? "" : "s"}`}
            </button>
            <Reveal open={open} id={contentId}>
              <IssueFixes
                issues={category.issues}
                className="mt-3 border-l border-line pl-4"
              />
              {category.passedCount > 0 && (
                <p className="mt-3 pl-4 font-mono text-xs text-muted-foreground">
                  {category.passedCount} other check
                  {category.passedCount === 1 ? "" : "s"} passed.
                </p>
              )}
            </Reveal>
          </>
        ) : category.passedCount > 0 ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            All {category.passedCount} checks passed.
          </p>
        ) : null}
      </div>
    </li>
  );
}
