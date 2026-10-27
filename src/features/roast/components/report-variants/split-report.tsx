"use client";

import type { ReportVariantProps } from "./shared";

import { ScoreSpeedometer } from "./score-speedometer";
import { Separator } from "@/components/section-separator";
import { CategoryList } from "@/features/roast/components/category-list";
import { FinalVerdict } from "@/features/roast/components/final-verdict";
import { LighthouseGauges } from "@/features/roast/components/score-summary";

/** Split layout: a score column that stays in view, the categories beside it. */
export function SplitReport({ result }: ReportVariantProps) {
  return (
    <section>
      <div className="screen-line-bottom grid md:grid-cols-[18rem_1fr]">
        <aside className="border-b border-line p-4 md:border-r md:border-b-0">
          {/* Stays in view below the sticky site header while the rows scroll. */}
          <div className="space-y-5 md:sticky md:top-[calc(var(--header-height)+1rem)]">
            <ScoreSpeedometer result={result} />
            <div className="space-y-1 text-center md:text-left">
              <p className="text-2xl font-medium tracking-tight">
                {result.grade}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.gradeNote}
              </p>
            </div>
            <LighthouseGauges
              result={result}
              needle
              // A 2 by 2 grid of cells split by lines, like a window pane.
              className="gap-0 border border-line *:border-line *:py-3 *:nth-[-n+2]:border-b *:odd:border-r"
            />
          </div>
        </aside>

        <CategoryList categories={result.categories} scoreStyle="watermark" />
      </div>

      <Separator className="screen-line-bottom border-x-0" />

      <div className="screen-line-bottom">
        <FinalVerdict result={result} />
      </div>
    </section>
  );
}
