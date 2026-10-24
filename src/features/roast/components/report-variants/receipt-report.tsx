"use client";

import type { ReportVariantProps } from "./shared";

import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import {
  Reveal,
  toneFor,
  fixMailto,
  TONE_TEXT,
  issueCount,
  IssueFixes,
  ACCENT_TEXT,
  ACCENT_BUTTON,
} from "./shared";

/** Variant 2: the roast as a printed receipt. Fixes are the itemized bill. */
export function ReceiptReport({ result, onRoastAnother }: ReportVariantProps) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const owed = issueCount(result);
  const scanned = new Date(result.scannedAt);

  return (
    <section className="screen-line-bottom px-4 py-8">
      <div className="mx-auto max-w-md rounded-sm border border-line bg-muted/30 font-mono text-sm shadow-[0_1px_0_var(--line)]">
        <div className="space-y-1 border-b border-dashed border-line p-5 text-center">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Roast &amp; Co. · Receipt
          </p>
          <h2 className="text-xl font-semibold tracking-tight normal-case">
            {result.domain}
          </h2>
          <p className="text-xs text-muted-foreground">
            {scanned.toLocaleDateString()} · {scanned.toLocaleTimeString()}
          </p>
        </div>

        <ul className="space-y-4 border-b border-dashed border-line p-5">
          {result.categories.map((category) => (
            <li key={category.key}>
              <div className="flex items-baseline gap-2">
                <span className="uppercase">{category.label}</span>
                <span className="mb-1 flex-1 border-b border-dotted border-muted-foreground/40" />
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    TONE_TEXT[toneFor(category.score)],
                  )}
                >
                  {category.score}
                </span>
              </div>
              <p className="mt-1 pl-3 font-serif text-sm text-muted-foreground italic">
                {category.line}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-1.5 border-b border-dashed border-line p-5">
          {result.lighthouse && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Lighthouse perf / a11y / bp / seo</dt>
              <dd className="tabular-nums">
                {result.lighthouse.performance}/
                {result.lighthouse.accessibility}/
                {result.lighthouse.bestPractices}/{result.lighthouse.seo}
              </dd>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <dt>Fixes owed</dt>
            <dd className="tabular-nums">{owed}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2 text-base">
            <dt className="font-semibold uppercase">Total score</dt>
            <dd className="text-3xl font-semibold tracking-tighter tabular-nums">
              {result.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Grade</dt>
            <dd className={cn("font-semibold uppercase", ACCENT_TEXT)}>
              {result.grade}
            </dd>
          </div>
        </dl>

        {owed > 0 && (
          <div className="border-b border-dashed border-line p-5">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen(!open)}
              className="w-full text-left text-xs tracking-wide uppercase underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              {open ? "Hide itemized fixes" : `Itemize ${owed} fixes`}
            </button>
            <Reveal open={open} id={contentId}>
              <IssueFixes
                issues={result.categories.flatMap((c) => c.issues)}
                className="pt-4 font-sans"
              />
            </Reveal>
          </div>
        )}

        <div className="space-y-4 p-5 text-center">
          <p className="font-serif text-base text-balance italic">
            “{result.verdict}”
          </p>
          <div
            aria-hidden
            className="mx-auto h-10 w-56 bg-[repeating-linear-gradient(90deg,var(--foreground)_0_2px,transparent_2px_4px,var(--foreground)_4px_5px,transparent_5px_8px)] opacity-70"
          />
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Thank you for getting roasted
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className={cn("flex-1", ACCENT_BUTTON)}>
          <a href={fixMailto(result)}>
            Pay up: get it fixed
            <ArrowRightIcon />
          </a>
        </Button>
        <Button variant="outline" size="lg" onClick={onRoastAnother}>
          <RotateCcwIcon />
          Roast another
        </Button>
      </div>
    </section>
  );
}
