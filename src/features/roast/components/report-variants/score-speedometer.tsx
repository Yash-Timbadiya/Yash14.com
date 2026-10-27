"use client";

import type { RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import {
  Gauge,
  GaugeArc,
  GaugeHub,
  GaugeTicks,
  GaugeTrack,
  GaugeNeedle,
  GaugeTickLabels,
} from "@/components/gauge";

/**
 * The priority-style speedometer: a half dial in the accent colour with a
 * needle on the score, and the number printed underneath.
 */
export function ScoreSpeedometer({
  result,
  className,
}: {
  result: RoastResult;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Gauge
        value={result.score}
        initialValue={0}
        transition
        // Clockwise from six o'clock: nine o'clock over the top to three.
        startAngle={90}
        endAngle={270}
        fit="content"
        padding={24}
        role="img"
        aria-label={`Roast score ${result.score} out of 100`}
        className="w-full max-w-60 text-foreground brand:text-[#ff4d00]"
      >
        <GaugeTrack width={22} opacity={0.16} cap="round" />
        <GaugeArc width={22} cap="round" />
        <GaugeTicks
          count={10}
          length={10}
          width={3}
          offset={-30}
          color="var(--muted-foreground)"
        />
        <GaugeTickLabels
          count={5}
          offset={-62}
          fontSize={20}
          font="mono"
          color="var(--muted-foreground)"
        />
        <GaugeNeedle
          style="line"
          length={0.72}
          width={7}
          color="var(--foreground)"
        />
        <GaugeHub radius={14} color="var(--foreground)" />
      </Gauge>
      <p className="mt-2 font-mono text-5xl font-semibold tracking-tighter tabular-nums">
        {result.score}
        <span className="text-sm font-normal tracking-normal text-muted-foreground">
          /100
        </span>
      </p>
    </div>
  );
}
