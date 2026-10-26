"use client";

import type { GaugeRange } from "./context";

import { cn } from "@/lib/utils";
import { angleToValue, clamp, foldValue, valueToAngle } from "./math";
import {
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

/** How far out from the centre a press starts counting as the ring, as a
    share of the half width. Inside it is the face, left for `onPress`. */
const FACE = 0.55;

/** Too near the centre for the angle under the pointer to mean anything. */
const HUB = 0.08;

/** The gauge angle under a point, measured round the element's centre. */
const angleAt = (el: HTMLElement, x: number, y: number) => {
  const box = el.getBoundingClientRect();
  const dx = x - (box.left + box.width / 2);
  const dy = y - (box.top + box.height / 2);
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    /* Gauge degrees start at six o'clock, a quarter turn behind the maths. */
    angle: (((theta - 90) % 360) + 360) % 360,
    /** How far out from the centre, as a share of the half width. */
    reach: Math.hypot(dx, dy) / (box.width / 2),
  };
};

/** Degrees between two angles the short way round. */
const turnBetween = (a: number, b: number) =>
  Math.abs(((((a - b) % 360) + 540) % 360) - 180);

/** A literal number widened, so `value={42}` still takes any number back. */
type Widen<V> = V extends number ? number : [number, number];

export type GaugeControlProps<V extends number | GaugeRange = number> = {
  /** A number for one handle, or a `[from, to]` range for two. */
  value: V;
  onChange: (value: Widen<V>) => void;
  /** A press on the middle of the face, or Enter, for a dial that is also a
      switch. Left out, the middle does nothing. */
  onPress?: () => void;
  min?: number;
  max?: number;
  /** Granularity a drag lands on, and the size of an arrow-key step. */
  step?: number;
  /** Gauge degrees, matching the gauge drawn inside. */
  startAngle?: number;
  endAngle?: number;
  /**
   * The domain is a closed ring, as the gauge's own `wrap`: values carry on
   * round past either end instead of holding there, and a range may run
   * across the seam, its ends in either order.
   */
  wrap?: boolean;
  /** Read to screen readers; every slider needs one. On a range it names the
      pair, and each thumb gets its own from `thumbLabels`. */
  label: string;
  /** Names for a range's two thumbs. Defaults to the label with "start" and
      "end" after it. */
  thumbLabels?: readonly [string, string];
  /** The value as it would be spoken: "21.5 °C" rather than 21.5. A range
      takes one for each end. */
  valueText?: V extends number ? string : readonly [string, string];
  /** The face turns like a knob: a drag anywhere on it moves the value by as
      far as the pointer goes round, rather than jumping to where it is. A
      range turns as a whole, keeping its width. */
  knob?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Makes the square gauge inside it a slider: drag round the ring to set it,
 * or use the arrow keys, Page Up and Down, Home and End. A drag past either
 * end of the sweep holds there rather than jumping to the other. A press in
 * the middle of the face, or Enter, is left for `onPress`, which a dimmer
 * uses to switch on and off, or, with `knob`, turns the face from where it
 * is. The domain and angles default to `Gauge`'s own.
 *
 * Given a `[from, to]` range it has two thumbs: a press on the ring takes
 * whichever is nearer, and each can be tabbed to and keyed on its own. On an
 * open domain they hold short of passing each other.
 */
export const GaugeControl = <V extends number | GaugeRange = number>({
  value,
  onChange,
  onPress,
  min = 0,
  max = 100,
  step = 1,
  startAngle = 40,
  endAngle = 320,
  wrap = false,
  label,
  thumbLabels,
  valueText,
  knob = false,
  disabled = false,
  className,
  children,
}: GaugeControlProps<V>) => {
  const range = typeof value !== "number";
  /* Both kinds are worked on as a list of ends: one for a value, two for a
     range. */
  const ends: number[] = range ? [...(value as GaugeRange)] : [value as number];
  const emit = (next: number[]) =>
    (onChange as (value: number | [number, number]) => void)(
      range ? [next[0], next[1]] : next[0],
    );

  /* Whether the press that is down started in the middle of the face. */
  const pressed = useRef(false);
  /* The end a drag on the ring is moving. */
  const active = useRef(0);
  /* A knob turn under way: the angle last seen, the ends when it began, and
     how far it has moved them before rounding to a step. */
  const turn = useRef<{ angle: number; base: number[]; by: number } | null>(
    null,
  );
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);

  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const snap = (v: number) => Math.round(v / step) * step;
  const settle = (v: number) => {
    const n = Number(v.toFixed(2));
    return wrap ? foldValue(n, lo, hi) : clamp(n, lo, hi);
  };

  /* Moves one end, holding it short of the other on an open domain. */
  const setEnd = (i: number, next: number) => {
    let v = settle(next);
    if (range && !wrap) {
      v = i === 0 ? Math.min(v, ends[1]) : Math.max(v, ends[0]);
    }
    emit(ends.map((e, j) => (j === i ? v : e)));
  };

  const valueUnder = (el: HTMLElement, x: number, y: number) =>
    snap(angleToValue(angleAt(el, x, y).angle, min, max, startAngle, endAngle));

  /* The end nearer the pointer, by angle so a ring measures across its seam.
     Two ends on top of each other part the way the press lies. */
  const nearest = (angle: number, under: number) => {
    if (!range) return 0;
    const [a, b] = ends.map((e) =>
      turnBetween(angle, valueToAngle(e, min, max, startAngle, endAngle)),
    );
    if (a !== b) return a < b ? 0 : 1;
    return under > ends[1] ? 1 : 0;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    const { angle, reach } = angleAt(el, e.clientX, e.clientY);
    if (reach < FACE && knob) {
      el.setPointerCapture(e.pointerId);
      turn.current = { angle, base: ends, by: 0 };
      return;
    }
    if (reach < FACE) {
      pressed.current = true;
      return;
    }
    el.setPointerCapture(e.pointerId);
    const under = valueUnder(el, e.clientX, e.clientY);
    active.current = nearest(angle, under);
    if (range) {
      /* Focus the thumb being dragged, as a native slider does, and keep
         the press from moving focus off it again. Browsers count focus from
         script as keyboard focus, so the thumb is marked as taken by the
         pointer until a key is pressed on it: the ring here and a
         GaugeTooltip both leave a marked thumb alone. */
      e.preventDefault();
      const thumb = thumbs.current[active.current];
      if (thumb) {
        thumb.dataset.pointer = "";
        thumb.focus({ preventScroll: true });
      }
    }
    setEnd(active.current, under);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const t = turn.current;
    if (t) {
      const { angle, reach } = angleAt(e.currentTarget, e.clientX, e.clientY);
      if (reach < HUB) return;
      /* The shortest way round from the last angle, so crossing six o'clock
         is a small step and not a whole turn back. */
      const delta = ((angle - t.angle + 540) % 360) - 180;
      let by = t.by + (delta / (endAngle - startAngle)) * (max - min);
      /* Held so every end stays inside an open domain, which keeps a
         range's width as it turns. */
      if (!wrap) {
        by = clamp(by, lo - Math.min(...t.base), hi - Math.max(...t.base));
      }
      turn.current = { ...t, angle, by };
      emit(t.base.map((v) => settle(v + snap(by))));
      return;
    }
    setEnd(active.current, valueUnder(e.currentTarget, e.clientX, e.clientY));
  };

  const onPointerUp = () => {
    if (pressed.current) onPress?.();
    pressed.current = false;
    turn.current = null;
  };

  const keyDown = (i: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    delete e.currentTarget.dataset.pointer;
    if (disabled) return;
    const v = ends[i];
    const big = (max - min) / 10;
    const moves: Record<string, number> = {
      ArrowUp: v + step,
      ArrowRight: v + step,
      ArrowDown: v - step,
      ArrowLeft: v - step,
      PageUp: v + big,
      PageDown: v - big,
      Home: min,
      End: max,
    };
    if (e.key in moves) {
      e.preventDefault();
      setEnd(i, moves[e.key]);
    } else if ((e.key === "Enter" || e.key === " ") && onPress) {
      e.preventDefault();
      onPress();
    }
  };

  /* The ARIA a thumb carries; a lone value's is the wrapper itself. */
  const slider = (i: number) => {
    const texts = valueText as string | readonly [string, string] | undefined;
    return {
      role: "slider",
      tabIndex: disabled ? -1 : 0,
      "aria-label": range
        ? (thumbLabels?.[i] ?? `${label} ${i === 0 ? "start" : "end"}`)
        : label,
      /* On an open domain each thumb stops at the other. */
      "aria-valuemin": range && !wrap && i === 1 ? ends[0] : min,
      "aria-valuemax": range && !wrap && i === 0 ? ends[1] : max,
      "aria-valuenow": ends[i],
      "aria-valuetext": typeof texts === "string" ? texts : texts?.[i],
      "aria-disabled": disabled,
      onKeyDown: keyDown(i),
    };
  };

  return (
    <div
      {...(range ? { role: "group", "aria-label": label } : slider(0))}
      data-slot="gauge-control"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pressed.current = false;
        turn.current = null;
      }}
      className={cn(
        "relative aspect-square touch-none rounded-full outline-none select-none focus-visible:ring-2 focus-visible:ring-ring has-[:focus-visible:not([data-pointer])]:ring-2 has-[:focus-visible:not([data-pointer])]:ring-ring",
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {children}
      {/* A range's thumbs are drawn by the gauge; these only take focus and
          keys, one per end, and speak for it. */}
      {range &&
        ends.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            {...slider(i)}
            onBlur={(e) => delete e.currentTarget.dataset.pointer}
            className="sr-only"
          />
        ))}
    </div>
  );
};
