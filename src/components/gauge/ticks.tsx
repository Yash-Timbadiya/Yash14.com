"use client";

import type { GaugeContextValue } from "./context";

import { cn } from "@/lib/utils";
import { useGauge } from "./context";
import { cutValues, foldValue, polar, stepValues } from "./math";
import {
  fadeColor,
  fontClass,
  weightClass,
  type FontFamily,
  type FontWeight,
  type StrokeCap,
  type ValueColor,
} from "./utils";

/**
 * Evenly spaced domain values for ticks. On a closed ring the last step lands
 * on the first, so it is dropped rather than drawn twice.
 */
const tickValues = (
  { min, max, startAngle, endAngle }: GaugeContextValue,
  count: number,
) => {
  const values = stepValues(min, max, count);
  if (endAngle - startAngle >= 360) values.pop();
  return values;
};

type RadialLineProps = {
  /** Length of each line along the radius. */
  length?: number;
  width?: number;
  /** One colour, or a function of each line's value to colour some apart:
      the ticks inside a range, or each in the colour of its zone. */
  color?: ValueColor;
  opacity?: number;
  cap?: StrokeCap;
  /** Radial offset of the line's midpoint from the reference radius. */
  offset?: number;
};

const RadialLines = ({
  values,
  length = 12,
  lengthOf,
  width = 2,
  color = "currentColor",
  opacity = 1,
  cap = "round",
  offset = 0,
}: RadialLineProps & {
  values: number[];
  /** A length per line, in place of `length`. */
  lengthOf?: (value: number) => number;
}) => {
  const { radius, angleOf } = useGauge();
  const each = typeof color === "function" ? color : undefined;

  return (
    <g
      stroke={typeof color === "string" ? color : undefined}
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap={cap}
    >
      {values.map((value, i) => {
        const half = (lengthOf?.(value) ?? length) / 2;
        const a = polar(radius + offset - half, angleOf(value));
        const b = polar(radius + offset + half, angleOf(value));
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={each?.(value)}
          />
        );
      })}
    </g>
  );
};

export type GaugeTicksProps = RadialLineProps & {
  /** Number of intervals across the domain; renders `count + 1` ticks. */
  count?: number;
};

/** Evenly spaced tick marks across the whole arc. */
export const GaugeTicks = ({ count = 10, ...props }: GaugeTicksProps) => {
  const gauge = useGauge();
  return <RadialLines values={tickValues(gauge, count)} {...props} />;
};

export type GaugeTickFillProps = Omit<RadialLineProps, "color"> & {
  /** Number of intervals across the domain; renders `count + 1` ticks. */
  count?: number;
  /** Where the lit stretch starts. Defaults to the start of the gauge's
      range, or `min` on a single value. */
  from?: number;
  /** Where it ends. Defaults to the current value, or a range's far end. */
  to?: number;
  /**
   * `fill` lights every tick from `from` to `to`, as an arc would fill.
   * `nearest` lights only the tick nearest each end: on a single value a
   * pointer made of ticks, on a range one at either end.
   */
  mode?: "fill" | "nearest";
  /** Colour of the lit ticks: one, or a function of each tick's value, so a
      fill can run through zones or a gradient. */
  color?: ValueColor;
  /** Colour of the ticks left unlit. Defaults to a faint `currentColor`. */
  dimColor?: ValueColor;
  /** Length of a lit tick, for meters whose live segments stand out.
      Defaults to `length`. */
  litLength?: number;
};

/**
 * Ticks that are the fill: the whole sweep is ticked, and those between the
 * ends of the value are lit while the rest stay dim. It follows the value
 * frame by frame as `GaugeArc` does, fills a range between its ends, and on
 * a wrapped gauge runs forward from the start across the seam. With
 * `mode="nearest"` it lights a single tick at each end instead, for a
 * pointer drawn in ticks. Lit and dim colours can each be a function of the
 * tick's value, so one primitive covers segmented meters, LED rings, zoned
 * dials and dot-matrix pointers.
 */
export const GaugeTickFill = ({
  count = 40,
  from,
  to,
  mode = "fill",
  color = "currentColor",
  dimColor = fadeColor("currentColor", 15),
  length = 12,
  litLength = length,
  ...props
}: GaugeTickFillProps) => {
  const gauge = useGauge();
  const values = tickValues(gauge, count);
  const tail = from ?? gauge.from;
  const head = to ?? gauge.value;
  const span = Math.abs(gauge.max - gauge.min);
  /* Slack for ticks that land on an end, whose step values carry float
     error. */
  const eps = span * 1e-6;

  /* How far round from the start a value sits, on a closed ring. */
  const ahead = (v: number) => foldValue(v - tail + eps, 0, span);
  const between = (v: number) =>
    gauge.wrap
      ? ahead(v) <= ahead(head) + eps
      : v >= Math.min(tail, head) - eps && v <= Math.max(tail, head) + eps;

  /* The tick nearest a value, measured round the seam on a ring. */
  const nearestTo = (target: number) => {
    const gap = (v: number) => {
      const d = Math.abs(v - target);
      return gauge.wrap ? Math.min(d, span - d) : d;
    };
    return values.reduce((best, v) => (gap(v) < gap(best) ? v : best));
  };
  const ends =
    mode === "nearest"
      ? new Set(
          gauge.range || from !== undefined
            ? [nearestTo(tail), nearestTo(head)]
            : [nearestTo(head)],
        )
      : null;

  const lit = new Map(
    values.map((v) => [v, ends ? ends.has(v) : between(v)] as const),
  );
  const paint = (c: ValueColor, v: number) =>
    typeof c === "function" ? c(v) : c;

  return (
    <RadialLines
      values={values}
      length={length}
      lengthOf={(v) => (lit.get(v) ? litLength : length)}
      color={(v) => paint(lit.get(v) ? color : dimColor, v)}
      {...props}
    />
  );
};

export type GaugeMarksProps = RadialLineProps & {
  /** Domain values to mark, for example the cutoffs between zones. */
  values?: number[];
  /**
   * Cut the domain into this many equal segments instead: the marks fall
   * between the segments, none at the two ends. On a closed ring the seam is
   * cut too, since the last segment meets the first there. Drawn in the
   * surface's colour over a band, they slice it the way a water ring is cut
   * into glasses.
   */
  count?: number;
};

/** Radial marks at arbitrary domain values, or at equal cuts of the domain. */
export const GaugeMarks = ({ values, count, ...props }: GaugeMarksProps) => {
  const { min, max, startAngle, endAngle } = useGauge();
  const marks =
    values ??
    (count && count > 1
      ? [
          ...(endAngle - startAngle >= 360 ? [min] : []),
          ...cutValues(min, max, count),
        ]
      : []);
  return <RadialLines values={marks} {...props} />;
};

export type GaugeTickLabelsProps = {
  count?: number;
  /** Radial offset of the label centre from the reference radius. */
  offset?: number;
  fontSize?: number;
  /** One colour, or a function of each label's value. */
  color?: ValueColor;
  font?: FontFamily;
  weight?: FontWeight;
  decimals?: number;
  format?: (value: number) => string;
};

/** Numeric labels at evenly spaced values across the arc. */
export const GaugeTickLabels = ({
  count = 10,
  offset = -48,
  fontSize = 16,
  color = "currentColor",
  font = "sans",
  weight = "medium",
  decimals = 0,
  format,
}: GaugeTickLabelsProps) => {
  const gauge = useGauge();
  const { radius, angleOf } = gauge;
  const values = tickValues(gauge, count);
  const each = typeof color === "function" ? color : undefined;

  return (
    <g
      fill={typeof color === "string" ? color : undefined}
      fontSize={fontSize}
      textAnchor="middle"
      dominantBaseline="central"
      className={cn(fontClass[font], weightClass[weight], "tabular-nums")}
    >
      {values.map((value, i) => {
        const p = polar(radius + offset, angleOf(value));
        return (
          <text key={i} x={p.x} y={p.y} fill={each?.(value)}>
            {format ? format(value) : value.toFixed(decimals)}
          </text>
        );
      })}
    </g>
  );
};
