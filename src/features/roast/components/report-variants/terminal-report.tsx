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
  ACCENT_TEXT,
  ScannedNote,
} from "./shared";

const BAR_WIDTH = 16;

function asciiBar(score: number) {
  const filled = Math.round((score / 100) * BAR_WIDTH);
  return `${"█".repeat(filled)}${"░".repeat(BAR_WIDTH - filled)}`;
}

function statusTag(score: number) {
  if (score < 50) return "FAIL";
  return score < 80 ? "WARN" : "PASS";
}

/** Variant 4: the scan log never ends; the report is its final output. */
export function TerminalReport({ result, onRoastAnother }: ReportVariantProps) {
  const slug = (label: string) =>
    label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section>
      <div className="screen-line-bottom p-4">
        <div className="overflow-x-auto rounded-lg border border-line bg-muted/40 p-4 font-mono text-xs leading-relaxed sm:text-sm">
          <p className="text-muted-foreground">
            $ roast {result.domain} --verbose
          </p>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-4">
            <h2 className="text-4xl font-semibold tracking-tighter tabular-nums sm:text-5xl">
              {result.score}
              <span className="text-base text-muted-foreground">/100</span>
            </h2>
            <p className={cn("font-semibold uppercase", ACCENT_TEXT)}>
              {result.grade}
            </p>
            <p className="text-muted-foreground"># {result.gradeNote}</p>
          </div>

          {result.lighthouse && (
            <p className="mt-2 text-muted-foreground">
              lighthouse perf=
              <span
                className={TONE_TEXT[toneFor(result.lighthouse.performance)]}
              >
                {result.lighthouse.performance}
              </span>{" "}
              a11y={result.lighthouse.accessibility} bp=
              {result.lighthouse.bestPractices} seo={result.lighthouse.seo}
            </p>
          )}

          <div className="mt-4 space-y-3">
            {result.categories.map((category) => (
              <TerminalCategory
                key={category.key}
                category={category}
                command={`roast fix ${slug(category.label)}`}
              />
            ))}
          </div>

          <p className="mt-4 text-muted-foreground"># verdict</p>
          <p className="font-serif text-base text-balance text-foreground italic sm:text-lg">
            {result.verdict}
          </p>
          <p className="mt-3 text-muted-foreground">
            ${" "}
            <span
              className="inline-block h-4 w-2 translate-y-0.5 bg-foreground"
              aria-hidden
            />
          </p>
        </div>
      </div>

      <ReportCta result={result} onRoastAnother={onRoastAnother} />
      <div className="px-4 pb-4">
        <ScannedNote result={result} />
      </div>
    </section>
  );
}

function TerminalCategory({
  category,
  command,
}: {
  category: RoastCategory;
  command: string;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const tone = toneFor(category.score);
  const tag = statusTag(category.score);

  return (
    <div>
      <p className="whitespace-pre">
        <span
          className={cn(
            tag === "PASS" ? "text-muted-foreground" : TONE_TEXT[tone],
            "font-semibold",
          )}
        >
          [{tag}]
        </span>{" "}
        {category.label.toLowerCase().padEnd(16, " ")}
        <span className={TONE_TEXT[tone]}>{asciiBar(category.score)}</span>{" "}
        <span className="tabular-nums">
          {String(category.score).padStart(3, " ")}
        </span>
      </p>
      <p className="pl-7 text-muted-foreground"># {category.line}</p>

      {category.issues.length > 0 && (
        <div className="pl-7">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen(!open)}
            className="text-left text-foreground underline decoration-dotted underline-offset-4 hover:no-underline"
          >
            $ {command}
          </button>
          <Reveal open={open} id={contentId}>
            <ul className="mt-1 space-y-1">
              {category.issues.map((issue) => (
                <li key={issue.id}>
                  <span
                    className={
                      issue.status === "fail"
                        ? ACCENT_TEXT
                        : "text-muted-foreground"
                    }
                  >
                    ✗ {issue.label} ({issue.value})
                  </span>
                  {issue.fixes.map((fix) => (
                    <p key={fix} className="pl-4 text-muted-foreground">
                      → {fix}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      )}
    </div>
  );
}
