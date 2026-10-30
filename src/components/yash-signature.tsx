"use client";

import { motion, useReducedMotion } from "motion/react";

const SIGNATURE_PATH =
  "M4 102C2 92 8 80 30 72C60 62 120 46 148 25C140 42 120 52 108 63C98 73 82 88 82 95C82 102 100 97 112 91C128 84 150 72 168 58C172 55 177 50 179 47C165 66 140 92 128 105C110 130 80 160 50 176C30 186 8 176 16 160C24 144 60 130 90 122C110 117 140 110 160 109C166 108 172 107 176 108C166 102 148 112 150 122C152 132 170 126 177 108C175 118 174 126 180 128C188 128 195 123 201 119C196 112 206 106 218 108C212 110 204 110 202 112C204 120 208 126 206 134C202 142 192 146 192 142C192 138 200 136 206 134C212 130 218 126 224 122C260 80 300 30 320 5C300 32 250 92 220 132C232 118 252 106 258 113C262 118 256 126 263 125C295 120 345 117 396 114";

export function YashSignature({
  drawKey = 0,
  ...props
}: React.ComponentProps<"svg"> & {
  /** Changing this replays the draw animation. */
  drawKey?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative and aria-hidden; the printed name beside it is the label
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 400 184"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="4"
      aria-hidden
      {...props}
    >
      <motion.path
        key={drawKey}
        d={SIGNATURE_PATH}
        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        // The footer sits below the fold, so drawing on mount would finish unseen.
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          pathLength: { duration: 1.6, ease: "easeInOut" },
          opacity: { duration: 0.01 },
        }}
      />
    </svg>
  );
}
