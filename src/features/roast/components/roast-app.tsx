"use client";

import type { RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { decodePhoneNumber } from "@/utils/string";
import { USER } from "@/features/portfolio/data/user";
import { Separator } from "@/components/section-separator";
import { useId, useRef, useState, useEffect } from "react";
import { DissolveInput } from "@/components/dissolve-input";
import { useRoast } from "@/features/roast/hooks/use-roast";
import { FixCta } from "@/features/roast/components/fix-cta";
import { RotateCcwIcon, ChevronDownIcon } from "lucide-react";
import { ExportMenu } from "@/features/roast/components/export-menu";
import { CategoryList } from "@/features/roast/components/category-list";
import { FinalVerdict } from "@/features/roast/components/final-verdict";
import { ScoreSummary } from "@/features/roast/components/score-summary";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { VisitSiteButton } from "@/features/roast/components/visit-site-button";
import { AnimatedFlameIcon } from "@/features/roast/components/animated-flame-icon";

const SECTION = ANALYTICS_SECTIONS.ROAST_PAGE;
const URL_PARAM = "url";
// Brand mode gets the flame orange; monochrome keeps the theme's own primary
// (black in light mode, white in dark mode).
const ROAST_BUTTON_CLASS =
  "brand:bg-[#ff4d00] brand:text-white brand:hover:bg-[#e64500] brand:focus-visible:ring-[#ff4d00]/40";

export function RoastApp() {
  const inputId = useId();
  const [input, setInput] = useState("");
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const roastRequest = useRef(0);
  const { phase, logs, result, error, start, reset } = useRoast();

  async function roast(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;

    const request = ++roastRequest.current;
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
      // The URL stays in the box while it's roasted. Once the domain moves
      // into the result heading, the box empties (with the dissolve), unless
      // a newer roast or "Roast another" has taken over since.
      if (request === roastRequest.current) setInput("");
      requestAnimationFrame(() => resultHeadingRef.current?.focus());
    } else {
      trackEvent(ANALYTICS_EVENTS.ROAST_FAILED, {
        section: SECTION,
        url: trimmed,
      });
      // The URL is still in the box, so it can be fixed or retried.
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
    roastRequest.current++;
    trackEvent(ANALYTICS_EVENTS.ROAST_ANOTHER, { section: SECTION });
    reset();
    setInput("");
    syncUrlParam(null);
    // The button sits at the end of a long report; the input is back at the top.
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    document.getElementById(inputId)?.focus({ preventScroll: true });
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
          <DissolveInput
            id={inputId}
            value={input}
            onValueChange={setInput}
            placeholder="competitor-i-dont-like.com"
            clearLabel="Clear URL"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="url"
            maxLength={2048}
            disabled={phase === "scanning"}
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
          Brutal roasts ahead. Can you take it?
        </p>
      </form>

      {/* The log is only the wait; once the roast lands it gets out of the way. */}
      <AnimatePresence initial={false}>
        {(phase === "scanning" || phase === "error") && (
          <ScanLog key="scan-log" logs={logs} scanning={phase === "scanning"} />
        )}
      </AnimatePresence>

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

      <AnimatePresence initial={false}>
        {phase === "done" && result && (
          <RoastReport
            key="roast-report"
            result={result}
            headingRef={resultHeadingRef}
            onRoastAnother={roastAnother}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function ScanLog({ logs, scanning }: { logs: string[]; scanning: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="screen-line-bottom overflow-hidden"
      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0 } }
          : { height: 0, opacity: 0 }
      }
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      <div className="p-4">
        <div
          role="log"
          aria-live="polite"
          aria-busy={scanning}
          className="min-h-24 rounded-lg border border-line bg-muted/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm"
        >
          {logs.map((line, i) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: lines are append-only and never reorder
              key={i}
              className="whitespace-pre-wrap"
              initial={
                reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(3px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              {line}
            </motion.div>
          ))}
          {scanning && (
            <motion.span
              aria-hidden
              className="inline-block h-4 w-2 bg-foreground align-middle"
              // A steady terminal blink instead of a pulsing fade.
              animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
              transition={{
                duration: 1,
                times: [0, 0.5, 0.5, 1],
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
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
  const reduceMotion = useReducedMotion();
  // WhatsApp, not mailto: a mailto link does nothing on machines with no
  // mail app set up, which is most desktop browsers.
  const whatsappNumber = decodePhoneNumber(USER.phoneNumberB64).replace(
    /\D/g,
    "",
  );
  // A plain hello, no scores or roast talk. Names the visitor's site unless
  // they roasted this one.
  const isOwnSite = result.domain === new URL(USER.website).hostname;
  const whatsappText = `Hi ${USER.firstName}, I came across your website and really liked your work. I'd love to work with you${isOwnSite ? "" : ` on ${result.domain}`}.`;
  const fixHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <motion.section
      aria-labelledby="roast-result-heading"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.1 }}
    >
      <Separator className="screen-line-bottom border-x-0" />

      <div className="screen-line-bottom flex items-center justify-between gap-3 p-3">
        <h2
          id="roast-result-heading"
          ref={headingRef}
          tabIndex={-1}
          className="flex items-center gap-2 font-handwritten text-4xl leading-none font-medium tracking-normal text-foreground outline-none"
        >
          <AnimatedFlameIcon className="size-[0.8em] shrink-0 text-foreground brand:text-[#ff4d00]" />
          <span className="min-w-0 break-all">{result.domain}</span>
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <VisitSiteButton
            result={result}
            onVisit={() =>
              trackEvent(ANALYTICS_EVENTS.ROAST_VISIT_SITE, {
                section: SECTION,
                domain: result.domain,
              })
            }
          />
          <ExportMenu
            result={result}
            onExport={(format) =>
              trackEvent(ANALYTICS_EVENTS.ROAST_EXPORT, {
                section: SECTION,
                domain: result.domain,
                format,
              })
            }
          />
        </div>
      </div>

      <ScoreSummary result={result} />

      <Separator className="screen-line-bottom border-x-0" />

      <CategoryList
        categories={result.categories}
        className="screen-line-bottom"
        onFixesOpened={(category) =>
          trackEvent(ANALYTICS_EVENTS.ROAST_FIXES_OPENED, {
            section: SECTION,
            category: category.key,
          })
        }
      />

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

      <div className="screen-line-bottom">
        <FinalVerdict result={result} />
      </div>

      <Separator className="screen-line-bottom border-x-0" />

      <div className="screen-line-bottom">
        <FixCta
          href={fixHref}
          onRoastAnother={onRoastAnother}
          onFixClick={() =>
            trackEvent(ANALYTICS_EVENTS.ROAST_FIX_CLICK, {
              section: SECTION,
              domain: result.domain,
              score: result.score,
            })
          }
        />
      </div>
    </motion.section>
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
