"use client";

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useRef, useState, useLayoutEffect } from "react";

type Ghost = { id: number; text: string; x: number };

type DissolveInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "placeholder" | "className"
> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  clearLabel?: string;
  className?: string;
};

/**
 * Text input whose deleted characters lift away, and whose text dissolves
 * with a per-word streak when cleared (transitions.dev
 * "Input clear with dissolve"). The real <input> keeps the caret, selection
 * and accessibility; a mirror layer draws the text.
 */
export function DissolveInput({
  value,
  onValueChange,
  placeholder,
  clearLabel = "Clear",
  className,
  disabled,
  ...props
}: DissolveInputProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const previousValue = useRef(value);

  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [clearingText, setClearingText] = useState<string | null>(null);

  function syncScroll() {
    const input = inputRef.current;
    if (input && trackRef.current) {
      trackRef.current.style.transform = `translateX(${-input.scrollLeft}px)`;
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: syncScroll only reads refs
  useLayoutEffect(() => {
    const previous = previousValue.current;
    if (previous === value) return;
    previousValue.current = value;

    // Clearing several characters at once (the X button, select-all + delete) gets the full dissolve.
    if (!value && previous.length > 1 && !reduceMotion) {
      setClearingText(previous);
      return;
    }

    // Typing again mid-dissolve cancels it (its effect cleanup resets the layers).
    setClearingText(null);

    const { start, removed } = diff(previous, value);

    const input = inputRef.current;
    if (removed && input && !reduceMotion) {
      const x =
        Number.parseFloat(getComputedStyle(input).paddingLeft) +
        measureText(input, previous.slice(0, start)) -
        input.scrollLeft;
      setGhosts((current) => [
        ...current,
        { id: nextId.current++, text: removed, x },
      ]);
    }

    syncScroll();
    requestAnimationFrame(syncScroll);
  }, [value, reduceMotion]);

  useLayoutEffect(() => {
    if (clearingText === null) return;
    const wrap = wrapRef.current;
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    const placeholderEl = placeholderRef.current;
    const glow = glowRef.current;
    if (!wrap || !input || !mirror || !placeholderEl || !glow) return;

    return runDissolve({
      wrap,
      input,
      mirror,
      placeholder: placeholderEl,
      glow,
      text: clearingText,
      onDone: () => {
        setClearingText(null);
        if (trackRef.current) trackRef.current.style.transform = "";
      },
    });
  }, [clearingText]);

  const hasValue = value.length > 0;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "t-clear h-10 w-full min-w-0 rounded-lg border border-input bg-background font-mono text-sm transition-[color,box-shadow] focus-within:border-foreground/30",
        hasValue && "has-value",
        clearingText !== null && "is-clearing",
        disabled && "opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onScroll={syncScroll}
        onSelect={syncScroll}
        onKeyUp={syncScroll}
        placeholder={placeholder}
        disabled={disabled}
        className="size-full bg-transparent pr-9 pl-3 outline-none placeholder:text-transparent"
        {...props}
      />

      <div
        ref={mirrorRef}
        className="t-clear-mirror right-9 left-0 pl-3"
        aria-hidden
      >
        <span ref={trackRef} className="inline-block">
          {clearingText ?? value}
        </span>
      </div>

      <div className="t-clear-ghosts inset-x-0" aria-hidden>
        {ghosts.map((ghost) => (
          <span
            key={ghost.id}
            className="t-glyph-out"
            style={{ left: ghost.x }}
            onAnimationEnd={() =>
              setGhosts((current) => current.filter((g) => g.id !== ghost.id))
            }
          >
            {ghost.text}
          </span>
        ))}
      </div>

      <div
        ref={placeholderRef}
        className="t-clear-placeholder right-9 left-0 pl-3 text-muted-foreground/60"
        aria-hidden
      >
        {placeholder}
      </div>

      <div ref={glowRef} className="t-clear-glow" aria-hidden />

      {hasValue && !disabled && (
        <button
          type="button"
          aria-label={clearLabel}
          // Keep focus in the input so the caret is ready for the next URL.
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            onValueChange("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-2 z-4 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors animate-in fade-in-0 zoom-in-75 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** The changed middle between two strings, by common prefix and suffix. */
function diff(previous: string, next: string) {
  let start = 0;
  while (
    start < previous.length &&
    start < next.length &&
    previous[start] === next[start]
  ) {
    start++;
  }
  let endOffset = 0;
  while (
    endOffset < previous.length - start &&
    endOffset < next.length - start &&
    previous[previous.length - 1 - endOffset] ===
      next[next.length - 1 - endOffset]
  ) {
    endOffset++;
  }
  return { start, removed: previous.slice(start, previous.length - endOffset) };
}

let measureContext: CanvasRenderingContext2D | null = null;
function measureText(input: HTMLInputElement, text: string) {
  measureContext ??= document.createElement("canvas").getContext("2d");
  if (!measureContext) return 0;
  measureContext.font = getComputedStyle(input).font;
  return measureContext.measureText(text).width;
}

/** Cubic-bezier sampler so the JS-driven frames match the CSS easing tokens. */
function bezier(value: string) {
  const match = value.match(
    /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return (t: number) => t;
  const [x1, y1, x2, y2] = match.slice(1).map(Number.parseFloat);
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let s = t;
    for (let i = 0; i < 8; i++) {
      const dx = ((ax * s + bx) * s + cx) * s - t;
      const d = (3 * ax * s + 2 * bx) * s + cx;
      if (Math.abs(dx) < 1e-6 || d === 0) break;
      s -= dx / d;
    }
    return ((ay * s + by) * s + cy) * s;
  };
}

function glowColor() {
  const root = document.documentElement;
  if (root.dataset.brandColors !== "false") return "255,77,0";
  return root.classList.contains("dark") ? "255,255,255" : "0,0,0";
}

function buildGlow(wrap: HTMLElement, input: HTMLInputElement, text: string) {
  const styles = getComputedStyle(wrap);
  const spread =
    Number.parseFloat(styles.getPropertyValue("--glow-spread")) || 1.5;
  const heightScale =
    Number.parseFloat(styles.getPropertyValue("--glow-height")) || 1;
  const width = wrap.clientWidth || 280;
  const padLeft = Number.parseFloat(getComputedStyle(input).paddingLeft) || 12;
  const rgb = glowColor();
  const layers: string[] = [];
  let x = -input.scrollLeft;

  for (const segment of text.split(/(\s+)/)) {
    const segmentWidth = measureText(input, segment);
    if (segment.trim()) {
      const center = padLeft + x + segmentWidth / 2;
      const halfWidth = Math.max(segmentWidth * 0.45, 8) * spread;
      for (const [dx, widthScale, height, alpha] of [
        [0, 0.8, 7, 0.22],
        [halfWidth * 0.45, 0.55, 8, 0.18],
        [-halfWidth * 0.4, 0.65, 6, 0.16],
        [halfWidth * 0.15, 0.9, 5, 0.14],
      ]) {
        const left = (((center + dx) / width) * 100).toFixed(2);
        const radius = Math.max(halfWidth * widthScale, 2).toFixed(1);
        layers.push(
          `radial-gradient(ellipse ${radius}px ${(height * heightScale).toFixed(1)}px at ${left}% 100%, rgba(${rgb},${alpha}), transparent)`,
        );
      }
    }
    x += segmentWidth;
  }

  return layers.join(", ");
}

function runDissolve({
  wrap,
  input,
  mirror,
  placeholder,
  glow,
  text,
  onDone,
}: {
  wrap: HTMLElement;
  input: HTMLInputElement;
  mirror: HTMLElement;
  placeholder: HTMLElement;
  glow: HTMLElement;
  text: string;
  onDone: () => void;
}) {
  const styles = getComputedStyle(wrap);
  // The CSS build may minify `1000ms` to `1s`, so durations are read with their unit.
  const token = (name: string, fallback: number) => {
    const raw = styles.getPropertyValue(name).trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return fallback;
    return /\ds$/.test(raw) ? parsed * 1000 : parsed;
  };
  const total = token("--clear-dur", 1000);
  const outDuration = token("--clear-out-dur", 400);
  const inDuration = token("--clear-in-dur", 400);
  const outFly = token("--clear-out-fly", 12);
  const inFly = token("--clear-in-fly", 12);
  const blur = token("--clear-blur", 2);
  const delay = token("--glow-delay", 50);
  const peakAt = token("--glow-peak-at", 0.15);
  const isDark = document.documentElement.classList.contains("dark");
  // Screen blending on a dark surface needs more alpha to read.
  const glowOpacity = Math.min(
    1,
    token("--glow-opacity", 0.42) * (isDark ? 1.6 : 1),
  );
  const easeOut = bezier(styles.getPropertyValue("--clear-out-ease"));
  const easeIn = bezier(styles.getPropertyValue("--clear-in-ease"));

  glow.style.background = buildGlow(wrap, input, text);
  glow.style.opacity = "0";
  placeholder.style.transform = `translateY(-${inFly}px)`;
  placeholder.style.opacity = "0.9";
  placeholder.style.filter = `blur(${blur}px)`;

  const startedAt = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const elapsed = now - startedAt;

    const out = easeOut(Math.min(1, elapsed / outDuration));
    mirror.style.transform = `translateY(${(out * outFly).toFixed(1)}px)`;
    mirror.style.opacity = (1 - out).toFixed(3);
    mirror.style.filter = `blur(${(out * blur).toFixed(1)}px)`;

    const enter = easeIn(Math.min(1, elapsed / inDuration));
    placeholder.style.transform = `translateY(${(-inFly + enter * inFly).toFixed(1)}px)`;
    placeholder.style.opacity = (0.9 + enter * 0.1).toFixed(3);
    placeholder.style.filter = `blur(${(blur - enter * blur).toFixed(1)}px)`;

    let streak = 0;
    if (elapsed > delay) {
      const progress = Math.min(
        1,
        (elapsed - delay) / Math.max(1, total - delay),
      );
      streak =
        progress < peakAt
          ? progress / peakAt
          : 1 - (progress - peakAt) / (1 - peakAt);
    }
    glow.style.opacity = (streak * glowOpacity).toFixed(3);

    if (elapsed < total) {
      frame = requestAnimationFrame(tick);
    } else {
      reset();
      onDone();
    }
  };

  const reset = () => {
    for (const element of [mirror, placeholder]) {
      element.style.transform = "";
      element.style.opacity = "";
      element.style.filter = "";
    }
    glow.style.opacity = "0";
    glow.style.background = "";
  };

  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    reset();
  };
}
