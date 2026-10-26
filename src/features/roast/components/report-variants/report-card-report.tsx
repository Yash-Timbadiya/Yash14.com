"use client";

import type { ReportVariantProps } from "./shared";
import type { RoastCategory } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { USER } from "@/features/portfolio/data/user";
import {
  Reveal,
  toneFor,
  TONE_TEXT,
  ReportCta,
  IssueFixes,
  letterGrade,
  ACCENT_TEXT,
  ScannedNote,
} from "./shared";

/** Variant 3: a school report card. Letter grades, teacher's comments, a stamp. */
export function ReportCardReport({
  result,
  onRoastAnother,
}: ReportVariantProps) {
  return (
    <section>
      <div className="screen-line-bottom relative overflow-hidden p-4 sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">
          Report card · Term {new Date(result.scannedAt).getFullYear()}
        </p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
          {result.domain}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {result.grade}. {result.gradeNote}
        </p>

        <div
          className={cn(
            "absolute top-4 right-4 flex size-24 rotate-[-12deg] flex-col items-center justify-center rounded-full border-[3px] border-current sm:top-6 sm:right-8 sm:size-28",
            ACCENT_TEXT,
          )}
          role="img"
          aria-label={`Overall grade ${letterGrade(result.score)}, ${result.score} out of 100`}
        >
          <span className="font-serif text-5xl leading-none font-semibold sm:text-6xl">
            {letterGrade(result.score)}
          </span>
          <span className="font-mono text-[10px] tracking-widest">
            {result.score}/100
          </span>
        </div>
      </div>

      <div className="screen-line-bottom overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            <tr className="border-b border-line">
              <th className="p-4 font-normal">Subject</th>
              <th className="p-4 font-normal">Grade</th>
              <th className="p-4 font-normal">Teacher's comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result.categories.map((category) => (
              <SubjectRow key={category.key} category={category} />
            ))}
          </tbody>
        </table>
      </div>

      {result.lighthouse && (
        <p className="screen-line-bottom p-4 font-mono text-xs text-muted-foreground">
          Attendance (Lighthouse): performance {result.lighthouse.performance} ·
          accessibility {result.lighthouse.accessibility} · best practices{" "}
          {result.lighthouse.bestPractices} · SEO {result.lighthouse.seo}
        </p>
      )}

      <div className="screen-line-bottom space-y-3 p-4 sm:p-6">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Principal's remarks
        </p>
        <p className="font-serif text-xl text-balance italic sm:text-2xl">
          {result.verdict}
        </p>
        <p className="font-serif text-sm text-muted-foreground">
          — {USER.displayName}, Head of Roasting
        </p>
      </div>

      <ReportCta
        result={result}
        onRoastAnother={onRoastAnother}
        title="Needs a tutor? I take private lessons."
      />
      <div className="px-4 pb-4">
        <ScannedNote result={result} />
      </div>
    </section>
  );
}

function SubjectRow({ category }: { category: RoastCategory }) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const tone = toneFor(category.score);

  return (
    <tr className="align-top">
      <td className="p-4 font-medium whitespace-nowrap">{category.label}</td>
      <td className="p-4">
        <span
          className={cn(
            "font-serif text-2xl leading-none font-semibold",
            TONE_TEXT[tone],
          )}
        >
          {letterGrade(category.score)}
        </span>
        <span className="ml-1.5 font-mono text-xs text-muted-foreground tabular-nums">
          {category.score}
        </span>
      </td>
      <td className="p-4">
        <p className="font-serif text-base text-pretty italic">
          {category.line}
        </p>
        {category.issues.length > 0 && (
          <>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen(!open)}
              className="mt-2 font-mono text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              {open
                ? "Hide detention notes"
                : `Detention notes (${category.issues.length})`}
            </button>
            <Reveal open={open} id={contentId}>
              <IssueFixes issues={category.issues} className="pt-3" />
            </Reveal>
          </>
        )}
      </td>
    </tr>
  );
}
