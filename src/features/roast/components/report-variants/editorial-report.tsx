"use client";

import type { ReportVariantProps } from "./shared";
import type { RoastCategory } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import {
  Reveal,
  toneFor,
  TONE_TEXT,
  ReportCta,
  IssueFixes,
  ACCENT_TEXT,
  ScannedNote,
} from "./shared";

/** Variant 5: a magazine feature. The verdict is the headline, categories are numbered sections. */
export function EditorialReport({
  result,
  onRoastAnother,
}: ReportVariantProps) {
  return (
    <section>
      <header className="screen-line-bottom space-y-4 p-4 sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
          The roast · Issue {result.score}
        </p>
        <h2 className="font-serif text-3xl leading-tight text-balance sm:text-5xl">
          {result.verdict}
        </h2>
        <p className="text-sm text-muted-foreground">
          A review of{" "}
          <span className={cn("font-medium", ACCENT_TEXT)}>
            {result.domain}
          </span>{" "}
          · scored{" "}
          <span className="font-medium text-foreground">
            {result.score}/100
          </span>{" "}
          · {result.grade.toLowerCase()}
        </p>
      </header>

      {result.lighthouse && (
        <dl className="screen-line-bottom grid grid-cols-4 divide-x divide-line text-center">
          {(
            [
              ["Perf", result.lighthouse.performance],
              ["A11y", result.lighthouse.accessibility],
              ["Best", result.lighthouse.bestPractices],
              ["SEO", result.lighthouse.seo],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="p-3">
              <dd
                className={cn("font-serif text-2xl", TONE_TEXT[toneFor(value)])}
              >
                {value}
              </dd>
              <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {label}
              </dt>
            </div>
          ))}
        </dl>
      )}

      <ol className="screen-line-bottom divide-y divide-line">
        {result.categories.map((category, i) => (
          <EditorialSection
            key={category.key}
            category={category}
            index={i + 1}
          />
        ))}
      </ol>

      <ReportCta
        result={result}
        onRoastAnother={onRoastAnother}
        title="Letters to the editor: fixes welcome."
      />
      <div className="px-4 pb-4">
        <ScannedNote result={result} />
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
            </Reveal>
          </>
        ) : (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            All {category.passedCount} checks passed.
          </p>
        )}
      </div>
    </li>
  );
}
