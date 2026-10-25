"use client";

import type { RoastCheck, RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { decodeEmail } from "@/utils/string";
import { Button } from "@/components/ui/button";
import { USER } from "@/features/portfolio/data/user";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type ReportVariantProps = {
  result: RoastResult;
  onRoastAnother?: () => void;
};

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Brand orange in brand mode, plain ink in monochrome. */
export const ACCENT_TEXT = "brand:text-[#ff4d00]";
export const ACCENT_BG = "bg-foreground brand:bg-[#ff4d00]";
export const ACCENT_BUTTON =
  "brand:bg-[#ff4d00] brand:text-white brand:hover:bg-[#e64500] brand:focus-visible:ring-[#ff4d00]/40";

export type Tone = "bad" | "meh" | "good";

export function toneFor(score: number): Tone {
  if (score < 50) return "bad";
  return score < 80 ? "meh" : "good";
}

export const TONE_TEXT: Record<Tone, string> = {
  bad: ACCENT_TEXT,
  meh: "text-foreground/80",
  good: "text-foreground",
};

export const TONE_BAR: Record<Tone, string> = {
  bad: ACCENT_BG,
  meh: "bg-foreground/55",
  good: "bg-foreground",
};

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

export function letterGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function fixMailto(result: RoastResult) {
  const params = new URLSearchParams({
    subject: `Fix my site: you roasted ${result.domain}`,
    body: `Hi ${USER.firstName},\n\nYour roaster gave ${result.domain} ${result.score}/100 ("${result.grade}"). Let's fix that.\n\n`,
  });
  return `mailto:${decodeEmail(USER.emailB64)}?${params.toString().replaceAll("+", "%20")}`;
}

export function issueCount(result: RoastResult) {
  return result.categories.reduce((sum, c) => sum + c.issues.length, 0);
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

export function ReportCta({
  result,
  onRoastAnother,
  title = "Brutal? Yes. Fixable? Also yes.",
  body = "Roasts are free. Fixes aren't, but a site people trust pays for itself. I build fast, accessible websites that don't need a roast.",
  className,
}: ReportVariantProps & {
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="mt-1 text-sm text-balance text-muted-foreground">
          {body}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className={ACCENT_BUTTON}>
          <a href={fixMailto(result)}>
            Get it fixed
            <ArrowRightIcon />
          </a>
        </Button>
        <Button variant="outline" size="lg" onClick={onRoastAnother}>
          <RotateCcwIcon />
          Roast another
        </Button>
      </div>
    </div>
  );
}

export function ScannedNote({ result }: { result: RoastResult }) {
  return (
    <p className="font-mono text-xs text-muted-foreground">
      {result.cached ? "Served from a recent roast. " : ""}
      Scanned {new Date(result.scannedAt).toLocaleString()}. Homepage only;
      content rendered by JavaScript may be missed.
    </p>
  );
}
