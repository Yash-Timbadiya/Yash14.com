"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

type AsciiVariant = "islands" | "terrain" | "mark";

const CHAR_WIDTH = 6.6;
const CHAR_HEIGHT = 11;
const FONT_SIZE = 9;
const FRAME_MS = 130;
const RAMP = ".:-=+*xX#";

/** The flat YT mark on its 6 x 4 grid, as drawn in `yt-mark.tsx`. */
const MARK = [
  [1, 0, 1, 1, 1, 1],
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 0],
];

function hash(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const top = hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u;
  const bottom = hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u;
  return top * (1 - v) + bottom * v;
}

function fbm(x: number, y: number) {
  return noise(x, y) * 0.65 + noise(x * 2.1 + 7, y * 2.1 + 3) * 0.35;
}

type Sample = {
  col: number;
  row: number;
  cols: number;
  rows: number;
  time: number;
  seed: number;
};

/**
 * Sparse clouds that wander: the drift swings left and right and up and down
 * on two slow, out-of-step waves, so they never just slide one way.
 */
function sampleIslands({ col, row, time, seed }: Sample) {
  const driftX = Math.sin(time * 0.11 + seed) * 1.4;
  const driftY = Math.cos(time * 0.07 + seed * 2) * 0.6;
  const body = fbm(
    col * 0.05 + seed + driftX,
    row * 0.11 + driftY + time * 0.02,
  );
  // A finer layer flowing against the drift, so edges keep billowing and the
  // shapes change all the time rather than only shifting.
  const billow = noise(col * 0.12 - time * 0.35, row * 0.24 + time * 0.25);
  const value = body * 0.72 + billow * 0.28;
  return value < 0.52 ? 0 : (value - 0.52) / 0.48;
}

/** A ridge line, rising towards both edges and denser towards its base. */
function sampleTerrain({ col, row, cols, rows, time, seed }: Sample) {
  const edge = Math.abs((col / Math.max(cols - 1, 1)) * 2 - 1);
  const ridge = fbm(edge * 7 + seed, 0.5);
  const height = rows * (0.12 + edge ** 1.3 * 0.88) * (0.45 + ridge * 0.7);
  const depth = rows - row;
  if (depth > height) return 0;

  const fill = 1 - depth / height;
  if (noise(col * 0.8, row * 0.8 + time * 0.4) > 0.22 + fill * 0.8) return 0;
  return Math.min(fill * 0.55 + noise(col * 0.3, row * 0.3 + time) * 0.3, 1);
}

/** The YT mark, filled with shimmering characters. */
const inMark = (x: number, y: number) =>
  Boolean(MARK[Math.floor(y)]?.[Math.floor(x)]);

/** Wraps into [0, length), for negative values too. */
const wrap = (value: number, length: number) =>
  ((value % length) + length) % length;

/**
 * The flat YT mark, with a bright diagonal band of light sweeping across it
 * every few seconds. The seed offsets the sweep, so two marks never pulse
 * together.
 */
function sampleMark({ col, row, cols, rows, time, seed }: Sample) {
  // Leaves a margin, so the mark never touches the edges of its panel.
  const unitX = Math.min(
    (cols * 0.8) / 6,
    (rows * 0.8 * CHAR_HEIGHT) / CHAR_WIDTH / 4,
  );
  const unitY = (unitX * CHAR_WIDTH) / CHAR_HEIGHT;
  const left = (cols - unitX * 6) / 2;
  const top = (rows - unitY * 4) / 2;
  const x = (col - left) / unitX;
  const y = (row - top) / unitY;

  if (!inMark(x, y)) return 0;

  const grain = noise(col * 0.28, row * 0.42 + time * 0.6);
  // Distance from the sweep's centre line, which crosses the 6-unit-wide
  // mark and then pauses off-screen before the next pass.
  const sweep = wrap(x + y * 0.7 - time * 1.6 - seed * 2.3, 14) - 3;
  const light = Math.max(0, 1 - Math.abs(sweep) / 1.1);
  return Math.min(0.25 + grain * 0.45 + light * 0.6, 1);
}

const SAMPLERS: Record<AsciiVariant, (sample: Sample) => number> = {
  islands: sampleIslands,
  terrain: sampleTerrain,
  mark: sampleMark,
};

/**
 * Procedural ASCII art on a canvas. Only animates while on screen, and draws a
 * single frame for visitors who prefer reduced motion.
 */
export function AsciiField({
  variant,
  seed = 1,
  className,
}: {
  variant: AsciiVariant;
  seed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const sampler = SAMPLERS[variant];

    let cols = 0;
    let rows = 0;
    let frame = 0;
    let lastDraw = 0;
    let visible = false;

    const draw = (now: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const styles = getComputedStyle(canvas);
      const time = reduceMotion ? 0 : now / 1000;

      context.clearRect(0, 0, width, height);
      context.font = `${FONT_SIZE}px ${styles.fontFamily}`;
      context.fillStyle = styles.color;
      context.textBaseline = "top";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const value = sampler({ col, row, cols, rows, time, seed });
          if (value <= 0) continue;

          context.globalAlpha = 0.35 + value * 0.65;
          context.fillText(
            RAMP[Math.min(Math.floor(value * RAMP.length), RAMP.length - 1)],
            col * CHAR_WIDTH,
            row * CHAR_HEIGHT,
          );
        }
      }
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        draw(now);
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !reduceMotion) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      cols = Math.ceil(width / CHAR_WIDTH);
      rows = Math.ceil(height / CHAR_HEIGHT);
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    viewObserver.observe(canvas);

    // The color comes from CSS, so a static frame must redraw on theme changes.
    const themeObserver = new MutationObserver(() => draw(performance.now()));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-brand-colors"],
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [variant, seed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none font-mono", className)}
      aria-hidden
    />
  );
}
