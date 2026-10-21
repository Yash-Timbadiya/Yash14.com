"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

function HandwrittenNote({
  className,
  ...props
}: React.ComponentProps<typeof motion.div>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      data-slot="handwritten-note"
      className={cn(
        "pointer-events-none absolute font-handwritten text-xl/none tracking-normal text-muted-foreground select-none",
        className,
      )}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    />
  );
}

/** Curves down and to the right. Rotate or mirror it to aim at the subject. */
function HandwrittenArrow({
  className,
  ...props
}: React.ComponentProps<typeof motion.svg>) {
  const maskId = `handwritten-arrow-${useId().replace(/:/g, "")}`;
  const shouldReduceMotion = useReducedMotion();
  const tailPath = "M4 4c1 21 12 28 74 33";

  return (
    <motion.svg
      className={cn("h-12 w-24 shrink-0 text-muted-foreground", className)}
      viewBox="0 0 96 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <mask id={maskId}>
          <motion.path
            d={tailPath}
            fill="none"
            stroke="white"
            strokeWidth="4"
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.72,
              delay: shouldReduceMotion ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </mask>
      </defs>

      <path d={tailPath} strokeDasharray="5 4" mask={`url(#${maskId})`} />
      <motion.path
        d="m68 29 11 8-12 6"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.22,
          delay: shouldReduceMotion ? 0 : 0.64,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </motion.svg>
  );
}

export { HandwrittenArrow, HandwrittenNote };
