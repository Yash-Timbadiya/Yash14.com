"use client";

import type { RoastCategory, RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { decodeEmail } from "@/utils/string";
import { Button } from "@/components/ui/button";
import { USER } from "@/features/portfolio/data/user";
import { useId, useRef, useState, useEffect } from "react";
import { useRoast } from "@/features/roast/hooks/use-roast";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { ArrowRightIcon, RotateCcwIcon, ChevronDownIcon } from "lucide-react";
import { AnimatedFlameIcon } from "@/features/roast/components/animated-flame-icon";

const SECTION = ANALYTICS_SECTIONS.ROAST_PAGE;
const URL_PARAM = "url";
// Brand mode gets the flame orange; monochrome keeps the theme's own primary
// (black in light mode, white in dark mode).
const ROAST_BUTTON_CLASS =
  "brand:bg-[#fa5d19] brand:text-white brand:hover:bg-[#e14d0e] brand:focus-visible:ring-[#fa5d19]/40";

export function RoastApp() {
  const inputId = useId();
  const [input, setInput] = useState("");
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const { phase, logs, result, error, start, reset } = useRoast();

  async function roast(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;

    setInput(trimmed);
    syncUrlParam(trimmed);
    trackEvent(ANALYTICS_EVENTS.ROAST_SUBMITTED, {
      section: SECTION,
      url: trimmed,
    });

    const roasted = await start(trimmed);
    if (roasted) {
      trackEvent(ANALYTICS_EVENTS.ROAST_COMPLETED, {
        section: SECTION,
        domain: roasted.domain,
        score: roasted.score,
        grade: roasted.grade,
        dead: roasted.dead?.reason ?? null,
        cached: roasted.cached,
      });
      requestAnimationFrame(() => resultHeadingRef.current?.focus());
    } else {
      trackEvent(ANALYTICS_EVENTS.ROAST_FAILED, {
        section: SECTION,
        url: trimmed,
      });
    }
  }

  // A shared /roast?url=... link runs straight away. Repeat roasts come
  // from the cache, so they don't use up the visitor's rate limit.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on mount for a shared link
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get(URL_PARAM);
    if (shared) void roast(shared);
  }, []);

  function roastAnother() {
    trackEvent(ANALYTICS_EVENTS.ROAST_ANOTHER, { section: SECTION });
    reset();
    setInput("");
    syncUrlParam(null);
  }

  return (
    <div>
      <form
        className="screen-line-bottom space-y-3 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void roast(input);
        }}
      >
        <label
          htmlFor={inputId}
          className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
        >
          Drop The URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="competitor-i-dont-like.com"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="url"
            maxLength={2048}
            disabled={phase === "scanning"}
            className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="lg"
            className={ROAST_BUTTON_CLASS}
            disabled={phase === "scanning" || !input.trim()}
          >
            <AnimatedFlameIcon className="size-4.5" />
            {phase === "scanning" ? "Roasting..." : "Roast it"}
          </Button>
        </div>
        <p className="text-sm text-balance text-muted-foreground">
          Takes 45 seconds. Brutal roasts ahead. Can you take it?
        </p>
      </form>

      {phase !== "idle" && (
        <ScanLog logs={logs} scanning={phase === "scanning"} />
      )}

      {phase === "error" && (
        <div className="screen-line-bottom flex items-center justify-between gap-4 p-4">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={roastAnother}>
            <RotateCcwIcon />
            Start over
          </Button>
        </div>
      )}

      {phase === "done" && result && (
        <RoastReport
          result={result}
          headingRef={resultHeadingRef}
          onRoastAnother={roastAnother}
        />
      )}
    </div>
  );
}

function ScanLog({ logs, scanning }: { logs: string[]; scanning: boolean }) {
  return (
    <div className="screen-line-bottom p-4">
      <div
        role="log"
        aria-live="polite"
        aria-busy={scanning}
        className="min-h-24 rounded-lg border border-line bg-muted/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm"
      >
        {logs.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lines are append-only and never reorder
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {scanning && (
          <span
            aria-hidden
            className="inline-block h-4 w-2 animate-pulse bg-foreground align-middle motion-reduce:animate-none"
          />
        )}
      </div>
    </div>
  );
}

function RoastReport({
  result,
  headingRef,
  onRoastAnother,
}: {
  result: RoastResult;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRoastAnother: () => void;
}) {
  const email = decodeEmail(USER.emailB64);
  const mailto = `mailto:${email}?${new URLSearchParams({
    subject: `Fix my site: you roasted ${result.domain}`,
    body: `Hi ${USER.firstName},\n\nYour roaster gave ${result.domain} ${result.score}/100 ("${result.grade}"). Let's fix that.\n\n`,
  })
    .toString()
    .replaceAll("+", "%20")}`;

  return (
    <section aria-labelledby="roast-result-heading">
      <div className="screen-line-bottom p-4">
        <h2
          id="roast-result-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-medium tracking-tight text-balance outline-none sm:text-3xl"
        >
          We looked at{" "}
          <span className="font-mono underline decoration-line decoration-2 underline-offset-4">
            {result.domain}
          </span>
          . We have notes.
        </h2>
      </div>

      <div className="screen-line-bottom grid sm:grid-cols-[auto_1fr]">
        <div className="flex items-baseline gap-1 border-line p-4 sm:border-r">
          <span className="font-mono text-6xl font-semibold tracking-tighter tabular-nums">
            {result.score}
          </span>
          <span className="font-mono text-sm text-muted-foreground">/100</span>
        </div>
        <div className="flex flex-col justify-center gap-1 border-t border-line p-4 sm:border-t-0">
          <p className="text-xl font-medium">{result.grade}</p>
          <p className="text-sm text-muted-foreground">{result.gradeNote}</p>
        </div>
      </div>

      {result.lighthouse && <LighthouseRow lighthouse={result.lighthouse} />}

      <div className="stripe-divider h-4 w-full" />

      <div className="screen-line-top screen-line-bottom grid sm:grid-cols-2">
        {result.categories.map((category, i) => (
          <CategoryCard
            key={category.key}
            category={category}
            dead={result.dead !== null}
            className={cn(
              "border-line",
              i > 0 && "border-t",
              i === 1 && "sm:border-t-0",
              i % 2 === 0 && "sm:border-r",
            )}
          />
        ))}
      </div>

      {result.dead && (
        <div className="screen-line-bottom p-4">
          <FixesToggle
            label="How do I fix this?"
            eventProperties={{ section: SECTION, category: "dead_site" }}
          >
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.dead.fixes.map((fix) => (
                <li key={fix}>{fix}</li>
              ))}
            </ul>
          </FixesToggle>
        </div>
      )}

      <div className="screen-line-bottom p-4">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Final verdict
        </p>
        <p className="mt-2 font-serif text-xl text-balance italic sm:text-2xl">
          {result.verdict}
        </p>
      </div>

      <div className="stripe-divider h-4 w-full" />

      <div className="screen-line-top screen-line-bottom space-y-4 p-4">
        <div>
          <p className="text-lg font-medium">Brutal? Yes. Fixable? Also yes.</p>
          <p className="mt-1 text-sm text-balance text-muted-foreground">
            Roasts are free. Fixes aren't, but a site people trust pays for
            itself. I build fast, accessible websites that don't need a roast.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg" className={ROAST_BUTTON_CLASS}>
            <a
              href={mailto}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.ROAST_FIX_CLICK, {
                  section: SECTION,
                  domain: result.domain,
                  score: result.score,
                })
              }
            >
              Get it fixed
              <ArrowRightIcon />
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={onRoastAnother}>
            <RotateCcwIcon />
            Roast another
          </Button>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {result.cached ? "Served from a recent roast. " : ""}
          Scanned {new Date(result.scannedAt).toLocaleString()}. Homepage only;
          content rendered by JavaScript may be missed.
        </p>
      </div>
    </section>
  );
}

function LighthouseRow({
  lighthouse,
}: {
  lighthouse: NonNullable<RoastResult["lighthouse"]>;
}) {
  const items = [
    ["Performance", lighthouse.performance],
    ["Accessibility", lighthouse.accessibility],
    ["Best practices", lighthouse.bestPractices],
    ["SEO", lighthouse.seo],
  ] as const;

  return (
    <dl className="screen-line-bottom grid grid-cols-2 sm:grid-cols-4">
      {items.map(([label, value], i) => (
        <div
          key={label}
          className={cn(
            "border-line p-4",
            i % 2 === 1 && "border-l",
            i >= 2 && "border-t sm:border-t-0",
            i === 2 && "sm:border-l",
          )}
        >
          <dt className="font-mono text-xs text-muted-foreground">
            Lighthouse {label}
          </dt>
          <dd
            className={cn(
              "mt-1 font-mono text-2xl font-semibold tabular-nums",
              value < 50 && "text-destructive",
            )}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CategoryCard({
  category,
  dead,
  className,
}: {
  category: RoastCategory;
  dead: boolean;
  className?: string;
}) {
  const { label, score, line, issues, passedCount } = category;

  return (
    <div className={cn("flex flex-col gap-3 p-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-xs tracking-wide uppercase">{label}</h3>
        <span className="font-mono text-lg font-semibold tabular-nums">
          {score}
        </span>
      </div>
      {/* Decorative: the score is already printed above as text. */}
      <div
        aria-hidden
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full",
            score < 50 ? "bg-destructive" : "bg-foreground",
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="font-serif text-base text-pretty italic">{line}</p>

      {!dead && issues.length > 0 && (
        <FixesToggle
          label={`Show ${issues.length} fix${issues.length === 1 ? "" : "es"}`}
          eventProperties={{ section: SECTION, category: category.key }}
        >
          <ul className="space-y-3">
            {issues.map((issue) => (
              <li key={issue.id} className="text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{issue.label}</span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-xs",
                      issue.status === "fail"
                        ? "text-destructive"
                        : "text-muted-foreground",
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
          {passedCount > 0 && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              {passedCount} other check{passedCount === 1 ? "" : "s"} passed.
            </p>
          )}
        </FixesToggle>
      )}

      {!dead && issues.length === 0 && passedCount > 0 && (
        <p className="font-mono text-xs text-muted-foreground">
          All {passedCount} checks passed.
        </p>
      )}
    </div>
  );
}

function FixesToggle({
  label,
  eventProperties,
  children,
}: {
  label: string;
  eventProperties: { section: typeof SECTION; category: string };
  children: React.ReactNode;
}) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-auto">
      <Button
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => {
          if (!open)
            trackEvent(ANALYTICS_EVENTS.ROAST_FIXES_OPENED, eventProperties);
          setOpen(!open);
        }}
      >
        {open ? "Hide fixes" : label}
        <ChevronDownIcon
          className={cn("transition-transform", open && "rotate-180")}
        />
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            key="fixes"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function syncUrlParam(value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(URL_PARAM, value);
  else url.searchParams.delete(URL_PARAM);
  window.history.replaceState(null, "", url);
}
