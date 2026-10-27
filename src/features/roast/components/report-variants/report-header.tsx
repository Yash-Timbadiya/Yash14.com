"use client";

import type { RoastResult } from "@/features/roast/types";

import { ExportMenu } from "@/features/roast/components/export-menu";
import { AnimatedFlameIcon } from "@/features/roast/components/animated-flame-icon";

/** The live report's top row: the roasted domain and the Export menu. */
export function ReportHeader({ result }: { result: RoastResult }) {
  return (
    <div className="screen-line-bottom flex items-center justify-between gap-3 p-3">
      <h2 className="flex items-center gap-2 font-handwritten text-4xl leading-none font-medium tracking-normal text-foreground">
        <AnimatedFlameIcon className="size-[0.8em] shrink-0 text-foreground brand:text-[#ff4d00]" />
        <span className="min-w-0 break-all">{result.domain}</span>
      </h2>
      <ExportMenu result={result} />
    </div>
  );
}
