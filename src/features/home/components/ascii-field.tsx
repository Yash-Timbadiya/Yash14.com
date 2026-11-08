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
 * Sparse clouds drifting sideways across the panel (about two characters a
 * second) while slowly changing shape.
 */
function sampleIslands({ col, row, time, seed }: Sample) {
  const value = fbm(col * 0.05 + seed - time * 0.1, row * 0.11 + time * 0.05);
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
function sampleMark({ col, row, cols, rows, time }: Sample) {
  // Leaves a margin, so the mark never touches the edges of its panel.
  const unitX = Math.min(
    (cols * 0.8) / 6,
    (rows * 0.8 * CHAR_HEIGHT) / CHAR_WIDTH / 4,
  );
  const unitY = (unitX * CHAR_WIDTH) / CHAR_HEIGHT;
  const left = (cols - unitX * 6) / 2;
  const top = (rows - unitY * 4) / 2;
  const gridX = Math.floor((col - left) / unitX);
  const gridY = Math.floor((row - top) / unitY);
  if (!MARK[gridY]?.[gridX]) return 0;
  return 0.3 + noise(col * 0.28, row * 0.42 + time * 0.8) * 0.7;
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
