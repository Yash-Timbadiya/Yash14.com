"use client";

import type { RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import {
  Gauge,
  GaugeArc,
  GaugeText,
  GaugeMarks,
  GaugeTicks,
  GaugeStack,
  GaugeTrack,
  GaugeValue,
  GaugeTickLabels,
} from "@/components/gauge";

// Brand orange in brand mode, ink in monochrome. The gauges draw in currentColor.
const ACCENT = "text-foreground brand:text-[#ff4d00]";

// Lighthouse counts 90 and above as good; each half gauge marks that line.
const LIGHTHOUSE_GOOD = 90;

/** Overall score dial, grade, and the four Lighthouse scores as half gauges. */
export function ScoreSummary({ result }: { result: RoastResult }) {
  const lighthouse = result.lighthouse
    ? ([
        ["Performance", result.lighthouse.performance],
        ["Accessibility", result.lighthouse.accessibility],
        ["Best practices", result.lighthouse.bestPractices],
        ["SEO", result.lighthouse.seo],
      ] as const)
    : null;

  return (
    <div className="screen-line-bottom grid sm:grid-cols-[auto_1fr]">
      <div className="flex items-center justify-center border-line p-4 sm:border-r sm:px-6">
        <ScoreDial result={result} />
      </div>

      <div className="flex flex-col justify-center gap-5 border-t border-line p-4 sm:border-t-0 sm:px-6">
        <div className="space-y-1">
          <p className="text-2xl font-medium tracking-tight">{result.grade}</p>
          <p className="text-sm text-muted-foreground">{result.gradeNote}</p>
        </div>

        {lighthouse && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
            {lighthouse.map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse items-center">
                <dt className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {label}
                </dt>
                <dd className="w-full max-w-24">
                  <Gauge
                    value={value}
                    initialValue={0}
                    transition
                    startAngle={90}
                    endAngle={270}
                    fit="content"
                    padding={22}
                    role="img"
                    aria-label={`Lighthouse ${label} ${value} out of 100`}
                    // Colour lives in the progress; the number stays neutral.
                    className={ACCENT}
                  >
                    <GaugeTrack width={34} opacity={TINT.rest} cap="butt" />
                    <GaugeArc width={34} cap="butt" />
                    <GaugeMarks
                      values={[LIGHTHOUSE_GOOD]}
                      length={30}
                      width={6}
                      color="var(--muted-foreground)"
                    />
                    <GaugeValue
                      y={-12}
                      fontSize={84}
                      font="mono"
                      color="var(--foreground)"
                      format={(v) => `${Math.round(v)}%`}
                    />
                  </Gauge>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {!lighthouse && !result.dead && (
          <p className="border-t border-line pt-4 font-mono text-xs text-balance text-muted-foreground">
            Google Lighthouse couldn't finish testing this site in time, so
            speed is judged from the raw page alone.
          </p>
        )}
      </div>
    </div>
  );
}

// A speedometer: ticks and labels inside the band. The band is three tints of
// the primary colour (orange in brand mode, ink in monochrome): full strength
// for the first 80% of the score, a lighter tint for its last 20%, and the
// lightest tint for the rest of the way to 100.
const LEAD_SHARE = 0.2;
const TINT = { main: 1, lead: 0.5, rest: 0.16 } as const;

function ScoreDial({ result }: { result: RoastResult }) {
  return (
    <Gauge
      value={result.score}
      initialValue={0}
      transition
      padding={30}
      role="img"
      aria-label={`Roast score ${result.score} out of 100`}
      className={cn("size-44 sm:size-52", ACCENT)}
    >
      <GaugeTrack width={30} opacity={TINT.rest} cap="butt" />
      <GaugeStack
        width={30}
        parts={[
          { weight: 1 - LEAD_SHARE, color: "currentColor", opacity: TINT.main },
          { weight: LEAD_SHARE, color: "currentColor", opacity: TINT.lead },
        ]}
      />

      <GaugeTicks
        count={20}
        length={8}
        width={2.5}
        offset={-36}
        color="var(--muted-foreground)"
      />
      <GaugeTicks
        count={5}
        length={16}
        width={4}
        offset={-40}
        color="var(--foreground)"
      />
      <GaugeTickLabels
        count={5}
        offset={-74}
        fontSize={24}
        font="mono"
        weight="semibold"
        color="var(--foreground)"
      />

      <GaugeValue
        y={14}
        fontSize={104}
        font="mono"
        // Only the score takes the primary colour; the scale stays neutral.
        color="currentColor"
        className="tracking-tighter"
      />
      <GaugeText
        y={74}
        fontSize={26}
        font="mono"
        weight="regular"
        color="var(--muted-foreground)"
      >
        of 100
      </GaugeText>
    </Gauge>
  );
}
