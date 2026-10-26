"use client";

import type { GaugeTransition } from "./transition";

import { createContext, useContext } from "react";
import { clamp, foldValue, valueToAngle } from "./math";
import { useAnimatedValue } from "./use-animated-value";

/**
 * A span of the domain rather than a single reading: a forecast's low and
 * high, a target band, a sleep window. Pass it as a gauge's `value` and the
 * arc fills between the two ends.
 */
export type GaugeRange = readonly [from: number, to: number];

export type GaugeContextValue = {
  /** Value being drawn this frame, clamped to the domain. Animated when the
      gauge has a transition. For a range, its far end. */
  value: number;
  /** Value the gauge is heading for; equals `value` once settled. */
  target: number;
  /** Where a range starts, animated alongside `value`. On a single value it
      is `min`, so the stretch from here to `value` is the fill either way. */
  from: number;
  /** Where `from` is heading for. */
  targetFrom: number;
  /** Whether the gauge shows a range rather than a single value. */
  range: boolean;
  /** Whether the domain is a closed ring, as the root's `wrap` sets. A range
      on one runs forward from `from` to `value`, across the seam if need be. */
  wrap: boolean;
  min: number;
  max: number;
  startAngle: number;
  endAngle: number;
  /** Radius of the gauge's reference circle in SVG units. */
  radius: number;
  /** Maps a domain value onto a gauge angle. */
  angleOf: (value: number) => number;
};

export const GaugeContext = createContext<GaugeContextValue | null>(null);

export const useGauge = () => {
  const ctx = useContext(GaugeContext);
  if (!ctx) {
    throw new Error("Gauge primitives must be rendered inside <Gauge>.");
  }
  return ctx;
};

/** The domain, geometry and animation every gauge root takes. */
export type GaugeDomainProps = {
  /**
   * The reading, or a `[from, to]` range to fill between. On an open domain
   * the two ends are put in order; on a wrapped one the range runs forward
   * from `from`, so `[22, 6]` on a 24-hour ring is the night, not the day.
   */
  value: number | GaugeRange;
  min?: number;
  max?: number;
  /** Gauge degrees, clockwise from six o'clock. */
  startAngle?: number;
  endAngle?: number;
  /** Reference radius in SVG units. Every child positions itself against this. */
  radius?: number;
  /**
   * Animate towards new values. `true` uses a gentle spring; pass a
   * `GaugeTransition` to tune it or switch to a timed tween. Omit for
   * instant updates.
   */
  transition?: GaugeTransition | boolean;
  /** Where the value starts on mount when animating, for a sweep-in effect.
      A single number starts both ends of a range there, so it opens out. */
  initialValue?: number | GaugeRange;
  /**
   * Treat the domain as circular, as a compass rose or clock face is: the
   * value is mapped into the domain modulo its span and animates the
   * shortest way round, so a heading crossing north never swings the long
   * way back. Meant for closed rings, where `min` and `max` read the same.
   */
  wrap?: boolean;
  /**
   * Turn the whole scale this many degrees clockwise, the way a compass card
   * turns under a fixed lubber line. Animated by `transition`, always the
   * shortest way round.
   */
  rotate?: number;
};

/**
 * Resolves the domain and follows the value, returning the context a gauge
 * root publishes to its children. Shared by `Gauge` and `GaugeInset` so a
 * gauge nested inside another animates and maps values exactly like a
 * top-level one, and so the defaults live in one place.
 */
export const useGaugeContextValue = ({
  value,
  min = 0,
  max = 100,
  startAngle = 40,
  endAngle = 320,
  radius = 200,
  transition,
  initialValue,
  wrap = false,
  rotate = 0,
}: GaugeDomainProps): GaugeContextValue => {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = hi - lo;
  /* A wrapped domain folds any value back inside itself instead of clamping,
     so 370° on a compass reads as 10°. */
  const fold = (v: number) => foldValue(v, lo, hi);
  const settle = wrap ? fold : (v: number) => clamp(v, lo, hi);

  const range = typeof value !== "number";
  /* An open range is put in order so every part can take `from` as the low
     end; a wrapped one keeps its order, which is what says which way round
     the ring it runs. */
  const ends = (pair: GaugeRange) =>
    wrap
      ? [settle(pair[0]), settle(pair[1])]
      : [settle(Math.min(...pair)), settle(Math.max(...pair))];
  const [targetFrom, target] = range ? ends(value) : [min, settle(value)];
  const [initialFrom, initialTo] =
    initialValue === undefined
      ? [undefined, undefined]
      : typeof initialValue === "number"
        ? [settle(initialValue), settle(initialValue)]
        : range
          ? ends(initialValue)
          : [undefined, settle(initialValue[1])];

  const shown = useAnimatedValue(target, transition, span, initialTo, wrap);
  /* Followed on a single value too, so the hooks run the same every render;
     it just sits at `min` there. */
  const shownFrom = useAnimatedValue(
    targetFrom,
    transition,
    span,
    range ? initialFrom : undefined,
    wrap,
  );
  /* The rotation is a bearing, so it always takes the short way round. */
  const turned = useAnimatedValue(rotate, transition, 360, undefined, true);
  const a0 = startAngle + turned;
  const a1 = endAngle + turned;

  return {
    /* Folded when wrapped, otherwise as the spring left it, overshoot and
       all — a bounce past the end is part of the motion. */
    value: wrap ? fold(shown) : shown,
    target,
    from: range && wrap ? fold(shownFrom) : shownFrom,
    targetFrom,
    range,
    wrap,
    min,
    max,
    startAngle: a0,
    endAngle: a1,
    radius,
    angleOf: (v) => valueToAngle(v, min, max, a0, a1),
  };
};
