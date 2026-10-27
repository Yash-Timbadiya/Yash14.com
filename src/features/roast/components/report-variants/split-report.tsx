"use client";

import type { ReportVariantProps } from "./shared";

import { ReportHeader } from "./report-header";
import { ScoreSpeedometer } from "./score-speedometer";
import { Separator } from "@/components/section-separator";
import { CategoryList } from "@/features/roast/components/category-list";
import { FinalVerdict } from "@/features/roast/components/final-verdict";
import { LighthouseGauges } from "@/features/roast/components/score-summary";

/** Split layout: the score column on the left, the categories on the right. */
export function SplitReport({ result, showHeader = true }: ReportVariantProps) {
  return (
    <section>
      {showHeader && <ReportHeader result={result} />}

      <div className="screen-line-bottom grid md:grid-cols-[18rem_1fr]">
        <aside className="border-b border-line p-4 md:border-r md:border-b-0">
          <div className="space-y-5">
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
