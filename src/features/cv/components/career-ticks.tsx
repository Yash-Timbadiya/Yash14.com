"use client";

import { useEffect, useRef } from "react";

export type CareerTick = {
  /** Position along the track, 0 (first month) to 1 (last month). */
  x: number;
  /** Resting height in px. */
  height: number;
  year: boolean;
  future: boolean;
};

/**
 * Magnifier, the same idea as the left ruler but horizontal: ticks near the
 * pointer are scaled (gain 0.48 → 1.48x at the centre) and fall off over a
 * bell of `reach` px.
 */
const HOVER = { gain: 0.48, reach: 28 };

/** Fraction of the remaining distance covered each frame; lower is softer. */
const EASE = 0.2;

/** Canvas height: tall enough for the largest magnified tick. */
const CANVAS_HEIGHT = 128;

/** Months still ahead are drawn faded. */
const FUTURE_ALPHA = 0.4;

/**
 * The timeline's month ticks, painted on a canvas snapped to real screen
 * pixels so every tick is equally crisp. Hovering the timeline magnifies the
 * ticks under the pointer; event dots (`[data-tick]`) ride on their tick.
 */
export function CareerTicks({ ticks }: { ticks: CareerTick[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const track = canvas?.parentElement;
    const area = track?.closest<HTMLElement>(".career");
    const root = track?.closest<HTMLElement>(".cv");
    if (!canvas || !context || !track || !area || !root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const heights = ticks.map((tick) => tick.height);
    let colors = { year: "#000", month: "#999" };
    let dpr = 1;
    let width = 0;
    // How far the canvas is nudged left so its pixels line up with the screen's.
    let shift = 0;
    let hoverX: number | null = null;
    let frame = 0;

    const readColors = () => {
      const style = getComputedStyle(root);
      colors = {
        year: style.getPropertyValue("--heading").trim(),
        month: style.getPropertyValue("--line-strong").trim(),
      };
    };

    const place = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = track.getBoundingClientRect();
      width = rect.width;
      const deviceLeft = rect.left * dpr;
      shift = (deviceLeft - Math.floor(deviceLeft)) / dpr;
      canvas.style.left = `${-shift}px`;
      canvas.style.width = `${width + 2}px`;
      canvas.width = Math.round((width + 2) * dpr);
      canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    };

    const dots = () => track.querySelectorAll<HTMLElement>("[data-tick]");

    const draw = () => {
      frame = 0;
      let moving = false;

      ticks.forEach((tick, i) => {
        const x = tick.x * width;
        const scale =
          hoverX === null
            ? 1
            : 1 +
              HOVER.gain *
                Math.exp(
                  -((x - hoverX) * (x - hoverX)) / (2 * HOVER.reach ** 2),
                );
        const target = tick.height * scale;
        const next = reduceMotion
          ? target
          : heights[i] + (target - heights[i]) * EASE;
        const settled = Math.abs(target - next) < 0.05;
        if (!settled) moving = true;
        heights[i] = settled ? target : next;
      });

      // Position, thickness and height all rounded to whole screen pixels.
      const thickness = Math.max(1, Math.round(dpr));
      context.clearRect(0, 0, canvas.width, canvas.height);
      ticks.forEach((tick, i) => {
        const h = Math.round(heights[i] * dpr);
        context.globalAlpha = tick.future ? FUTURE_ALPHA : 1;
        context.fillStyle = tick.year ? colors.year : colors.month;
        context.fillRect(
          Math.round((tick.x * width - 0.5 + shift) * dpr),
          canvas.height - h,
          thickness,
          h,
        );
      });
      context.globalAlpha = 1;

      for (const dot of dots()) {
        const i = Number(dot.dataset.tick);
        // The button stays put as a stable hover target; only its visible
        // dot, bar and label follow the tick's extra height.
        dot.style.setProperty(
          "--grow",
          `${(heights[i] - ticks[i].height).toFixed(2)}px`,
        );
      }

      if (moving) schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const refresh = () => {
      place();
      readColors();
      schedule();
    };

    // Mouse and pen only: a finger drag on a phone shouldn't magnify.
    /**
     * Hovering an event's candle, or the gap on either side of it right up to
     * the neighbouring candles, activates that event. When two events are in
     * range, the nearer one wins.
     */
    const setActiveEvent = (x: number | null) => {
      const spacing = width / (ticks.length - 1);
      let nearest: HTMLElement | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      if (x !== null) {
        for (const dot of dots()) {
          const distance = Math.abs(
            ticks[Number(dot.dataset.tick)].x * width - x,
          );
          if (distance < spacing && distance < nearestDistance) {
            nearest = dot;
            nearestDistance = distance;
          }
        }
      }
      for (const dot of dots())
        dot.toggleAttribute("data-active", dot === nearest);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hoverX = event.clientX - track.getBoundingClientRect().left;
      setActiveEvent(hoverX);
      schedule();
    };
    const onPointerLeave = () => {
      hoverX = null;
      setActiveEvent(null);
      schedule();
    };

    const themeObserver = new MutationObserver(() => {
      readColors();
      schedule();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(track);

    refresh();
    area.addEventListener("pointermove", onPointerMove);
    area.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      area.removeEventListener("pointermove", onPointerMove);
      area.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [ticks]);

  return <canvas className="career-canvas" ref={canvasRef} />;
}
