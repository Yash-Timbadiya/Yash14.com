"use client";

import type { RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import {
  Gauge,
  GaugeArc,
  GaugeDot,
  GaugeHub,
  GaugeText,
  fadeColor,
  GaugeTicks,
  GaugeTrack,
  GaugeStack,
  GaugeValue,
  polar,
  useGauge,
} from "@/components/gauge";

/*
 * Two dials from the gauge-ui "Smart home" example, recoloured for the site:
 * the thermostat ("Climate") for the overall score and the hi-fi volume knob
 * ("Music") for each Lighthouse score.
 */

// Brand orange in brand mode, ink in monochrome. The fills draw in currentColor.
const ACCENT = "text-foreground brand:text-[#ff4d00]";
const INK = "var(--foreground)";
const MUTED = "var(--muted-foreground)";
// Drawn in the page's own colour, to cut a band into segments.
const CUT = "var(--background)";

/** Open at the bottom, like both dials in the example. */
const SWEEP = { startAngle: 40, endAngle: 320 } as const;

// The share of the score, at its far end, drawn in the lighter tint. A white
// notch marks where that tint starts.
const LEAD_SHARE = 0.2;

/**
 * The thermostat: a ribbon of ticks round the face, filled up to the score,
 * a white notch where the lighter last 20% of the score begins, and a
 * handle on the score itself.
 */
export function ClimateScoreDial({
  result,
  className,
}: {
  result: RoastResult;
  className?: string;
}) {
  return (
    <Gauge
      value={result.score}
      max={100}
      {...SWEEP}
      padding={20}
      transition
      initialValue={0}
      role="img"
      aria-label={`Roast score ${result.score} out of 100`}
      className={cn("size-52 sm:size-56", ACCENT, className)}
    >
      <GaugeTrack width={26} color={INK} opacity={0.1} cap="butt" />
      {/* Full strength for the first 80% of the score, a lighter tint for
          the last 20%, like the live report's dial. */}
      <GaugeStack
        width={26}
        cap="butt"
        parts={[
          { weight: 1 - LEAD_SHARE, color: "currentColor", opacity: 1 },
          { weight: LEAD_SHARE, color: "currentColor", opacity: 0.5 },
        ]}
      />
      <GaugeTicks count={80} length={30} width={2.5} cap="butt" color={CUT} />
      <LeadNotch />
      <GaugeDot radius={14} color={INK} halo={6} haloColor={CUT} />
      <GaugeText y={-74} fontSize={22} weight="semibold" color={MUTED}>
        ROAST SCORE
      </GaugeText>
      <GaugeValue y={0} fontSize={96} weight="bold" color={INK} />
      <GaugeText y={76} fontSize={24} color={MUTED}>
        of 100
      </GaugeText>
    </Gauge>
  );
}

/**
 * A white notch where the lighter tint begins. Drawn from the animated value
 * rather than with GaugeMarks, whose values stay put, so it sweeps in with
 * the fill and the handle instead of waiting at its final spot.
 */
function LeadNotch({ length = 40, width = 4 }) {
  const { value, min, radius, angleOf } = useGauge();
  const angle = angleOf(min + (value - min) * (1 - LEAD_SHARE));
  const inner = polar(radius - length / 2, angle);
  const outer = polar(radius + length / 2, angle);
  return (
    <line
      x1={inner.x}
      y1={inner.y}
      x2={outer.x}
      y2={outer.y}
      stroke={INK}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

/**
 * The volume knob: a thin scale round the outside that fills with the score,
 * and a face with a single dot for its pointer.
 */
function VolumeKnob({ label, value }: { label: string; value: number }) {
  return (
    <Gauge
      value={value}
      max={100}
      {...SWEEP}
      padding={24}
      transition
      initialValue={0}
      role="img"
      aria-label={`Lighthouse ${label} ${value} out of 100`}
      className={cn("size-20 sm:size-24", ACCENT)}
    >
      <GaugeTicks
        count={20}
        length={12}
        width={3}
        offset={6}
        color={MUTED}
        opacity={0.45}
      />
      <GaugeTrack width={6} offset={-18} color={INK} opacity={0.12} />
      <GaugeArc width={6} offset={-18} />
      <GaugeHub radius={156} color={fadeColor(INK, 7)} />
      <GaugeDot radius={11} offset={-76} color={INK} />
      <GaugeValue y={0} fontSize={64} weight="bold" color={INK} />
    </Gauge>
  );
}

/** The four Lighthouse scores as volume knobs, or a note when it timed out. */
export function LighthouseKnobs({
  result,
  className,
}: {
  result: RoastResult;
  className?: string;
}) {
  if (!result.lighthouse) {
    return result.dead ? null : (
      <p
        className={cn(
          "p-4 font-mono text-xs text-balance text-muted-foreground",
          className,
        )}
      >
        Google Lighthouse couldn't finish testing this site in time, so speed is
        judged from the raw page alone.
      </p>
    );
  }

  const items = [
    ["Performance", result.lighthouse.performance],
    ["Accessibility", result.lighthouse.accessibility],
    ["Best practices", result.lighthouse.bestPractices],
    ["SEO", result.lighthouse.seo],
  ] as const;

  return (
    <dl
      className={cn(
        // Two columns by default; pass grid and border classes to lay it out.
        "grid grid-cols-2 text-center",
        className,
      )}
    >
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col-reverse items-center p-3">
          <dt className="font-mono text-[11px] text-muted-foreground">
            {label}
          </dt>
          <dd>
            <VolumeKnob label={label} value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
