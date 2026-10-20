"use client";

import type { Transition } from "motion/react";

import { useRef } from "react";
import { XIcon } from "@/components/icons";
import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { LinkPreview } from "@/components/link-preview";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

const INSPIRATION = {
  handle: "@iamncdai",
  href: "https://x.com/iamncdai",
};

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Credits the original design, told as an editor's correction: "copied" is
 * struck through by hand and "remixed" is scribbled in, played once on view.
 */
export function HelloInspiration({ className }: { className?: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();
  const play = inView || !!shouldReduceMotion;

  // Reduced motion jumps straight to the final frame.
  const at = (delay: number, duration: number): Transition =>
    shouldReduceMotion
      ? { duration: 0 }
      : { delay, duration, ease: EASE_OUT_QUINT };

  return (
    <li ref={ref} className={className}>
      Design inspired by{" "}
      <LinkPreview
        url={addQueryParams(INSPIRATION.href, UTM_PARAMS)}
        className="group/handle inline-flex items-baseline gap-1 font-medium whitespace-nowrap link-underline"
        side="top"
        onClick={() =>
          trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
            section: ANALYTICS_SECTIONS.HELLO,
            url: INSPIRATION.href,
          })
        }
      >
        <XIcon className="size-[0.8em] self-center transition-transform duration-500 ease-out group-hover/handle:rotate-360 motion-reduce:transition-none" />
        {INSPIRATION.handle}
      </LinkPreview>
      ,{" "}
      <span className="relative inline-block">
        <motion.del
          className="text-muted-foreground no-underline"
          initial={false}
          animate={{ opacity: play ? 0.55 : 1 }}
          transition={at(0.35, 0.4)}
        >
          copied
        </motion.del>
        <svg
          className="pointer-events-none absolute inset-x-[-4%] top-1/2 h-[0.7em] w-[108%] -translate-y-1/2 overflow-visible text-foreground/80"
          viewBox="0 0 64 16"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <title>Hand-drawn strikethrough</title>
          <motion.path
            d="M2 11C14 7 26 9 36 7S56 5 62 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: play ? 1 : 0 }}
            transition={at(0.3, 0.45)}
          />
        </svg>
      </span>{" "}
      <motion.span
        className="inline-block origin-bottom-left font-handwritten text-[1.3em] leading-none tracking-normal text-foreground"
        initial={{ opacity: 0, y: 6, rotate: -12, filter: "blur(4px)" }}
        animate={
          play
            ? { opacity: 1, y: 0, rotate: -4, filter: "blur(0px)" }
            : undefined
        }
        whileHover={
          shouldReduceMotion ? undefined : { rotate: [-4, 3, -6, -4] }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { delay: 0.8, type: "spring", duration: 0.6, bounce: 0.45 }
        }
      >
        remixed
      </motion.span>{" "}
      with my own taste &amp;{" "}
      <span className="relative inline-block">
        imagination
        <svg
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-[0.4em] w-full overflow-visible text-foreground/60"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <title>Hand-drawn squiggle underline</title>
          <motion.path
            d="M1 5C9 1 15 7 23 4S37 1 45 4 59 7 67 4 81 1 89 4 97 6 99 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: play ? 1 : 0 }}
            transition={at(1.3, 0.8)}
          />
        </svg>
      </span>
      .
    </li>
  );
}
