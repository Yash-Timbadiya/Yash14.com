"use client";

import { useEffect, useRef } from "react";

/** A long tick every SPACING rows; 6 short ticks sit between two long ones. */
const SPACING = 7;

/** Short ticks follow a slim, slim, slim, mid rhythm. */
const MID_EVERY = 4;

/** Each tick sits in a row this tall, which is also its hover target. */
const ROW = 9;
/** Where the line sits inside its row. */
const LINE_OFFSET = 4;
/** Tick thickness in CSS px, rounded to whole screen pixels when drawn. */
const THICKNESS = 1.5;
const LENGTH = { short: 21, long: 35 };

/**
 * Magnifier: ticks near the pointer are *scaled*, not lengthened by a fixed
 * amount, so a long tick grows far more than a short one. `gain` is the
 * extra scale at the centre (1.8 → 2.8x) and `reach` the bell's spread in
 * px.
 */
const HOVER = { gain: 1.8, reach: 24 };
// Half the hover growth, and only while the page is actually scrolling.
const SCROLL = { gain: HOVER.gain / 2, reach: 18 };

/** How long after the last scroll event the swell settles back, in ms. */
const SCROLL_IDLE = 150;

/**
 * The scroll swell's strength eases on its own: in quickly as scrolling
 * starts, out slowly (about 0.6s) once it stops, so the ticks settle back as
 * smoothly as they grew.
 */
const SCROLL_FADE = { in: 0.25, out: 0.07 };

/** Fraction of the remaining distance covered each frame; lower is softer. */
const EASE = 0.2;

/** Matches the page's scroll-padding-top, so a section lands below the edge. */
const SECTION_OFFSET = 96;

const bell = (distance: number, { gain, reach }: typeof HOVER) =>
  gain * Math.exp(-(distance * distance) / (2 * reach * reach));

type Tick = { position: number } & (
  | { kind: "long"; section: string; tone: "ink" | "major" }
  | { kind: "short"; tone?: "mid" }
);

const tickCount = (sections: number) => (sections - 1) * SPACING + 1;
const isLong = (position: number) => position % SPACING === 0;

/** Long ticks for each section (first and last in ink), short ones between. */
function buildTicks(sectionIds: string[]): Tick[] {
  return Array.from({ length: tickCount(sectionIds.length) }, (_, position) => {
    if (isLong(position)) {
      const index = position / SPACING;
      const isEnd = index === 0 || index === sectionIds.length - 1;
      return {
        position,
        kind: "long",
        section: sectionIds[index],
        tone: isEnd ? "ink" : "major",
      };
    }
    return (position % SPACING) % MID_EVERY === 0
      ? { position, kind: "short", tone: "mid" }
      : { position, kind: "short" };
  });
}

/** Scroll position at which a section sits at the top of the viewport. */
function sectionScrollTop(id: string) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const top = el.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
  return Math.min(max, Math.max(0, top));
}

/** The canvas wants plain rgb(); computed colours may be color(srgb ...). */
function toCanvasColor(computed: string) {
  const values = computed.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  const [r, g, b] = computed.startsWith("color(")
    ? values.slice(0, 3).map((v) => Math.round(v * 255))
    : values.slice(0, 3);
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Fixed reading ruler on the left edge. Each long tick is a section; the
 * orange line sits on a section's tick when that section reaches the top and
 * glides between ticks in between. Only long ticks are clickable.
 */
export function Ruler({ sectionIds }: { sectionIds: string[] }) {
  const ticks = buildTicks(sectionIds);
  const ticksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const container = ticksRef.current;
    const line = lineRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !line || !canvas || !context) return;

    const count = tickCount(sectionIds.length);
    const positions = Array.from({ length: count }, (_, i) => i);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lengths = positions.map((i) =>
      isLong(i) ? LENGTH.long : LENGTH.short,
    );
    let anchors: number[] = [];
    let colors: string[] = [];
    let dpr = 1;
    let hoverY: number | null = null;
    let scrolling = false;
    let scrollStrength = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;

    /** Fractional tick position for the current scroll, between sections. */
    const indicatorPosition = () => {
      const y = window.scrollY;
      if (anchors.length < 2 || y <= anchors[0]) return 0;
      for (let k = 0; k < anchors.length - 1; k++) {
        const from = anchors[k];
        const to = anchors[k + 1];
        if (y < to) {
          const t = to > from ? (y - from) / (to - from) : 1;
          return (k + t) * SPACING;
        }
      }
      return count - 1;
    };

    /**
     * Sizes the canvas to real screen pixels and centres the ruler on a top
     * that is a whole number of screen pixels, so the grid never starts
     * half a pixel off.
     */
    const place = () => {
      dpr = window.devicePixelRatio || 1;
      const height = count * ROW;
      const top = Math.round(((window.innerHeight - height) / 2) * dpr) / dpr;
      container.style.top = `${top}px`;
      container.style.transform = "none";
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const readColors = () => {
      colors = positions.map((i) => {
        const el = tickRefs.current[i];
        return el ? toCanvasColor(getComputedStyle(el).color) : "rgb(0 0 0)";
      });
    };

    const tick = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      // Every tick line sits LINE_OFFSET px into its row.
      const top = rect.top + LINE_OFFSET;
      const indicatorY = top + indicatorPosition() * ROW;
      line.style.transform = `translateY(${Math.round(indicatorY * dpr) / dpr}px)`;

      let moving = false;

      const strengthTarget = scrolling ? 1 : 0;
      scrollStrength = reduceMotion
        ? strengthTarget
        : scrollStrength +
          (strengthTarget - scrollStrength) *
            (scrolling ? SCROLL_FADE.in : SCROLL_FADE.out);
      if (Math.abs(strengthTarget - scrollStrength) < 0.002) {
        scrollStrength = strengthTarget;
      } else {
        moving = true;
      }

      for (const i of positions) {
        const y = top + i * ROW;
        const base = isLong(i) ? LENGTH.long : LENGTH.short;
        const scale =
          1 +
          Math.max(
            hoverY === null ? 0 : bell(y - hoverY, HOVER),
            scrollStrength * bell(y - indicatorY, SCROLL),
          );
        const target = base * scale;
        const next = reduceMotion
          ? target
          : lengths[i] + (target - lengths[i]) * EASE;
        const settled = Math.abs(target - next) < 0.1;
        if (!settled) moving = true;
        lengths[i] = settled ? target : next;
      }

      // Position, thickness and length all rounded to whole screen pixels,
      // so identical ticks render identically.
      const thickness = Math.max(1, Math.round(THICKNESS * dpr));
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const i of positions) {
        context.fillStyle = colors[i];
        context.fillRect(
          0,
          Math.round((i * ROW + LINE_OFFSET) * dpr),
          Math.round(lengths[i] * dpr),
          thickness,
        );
      }

      if (moving) schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const measure = () => {
      place();
      readColors();
      anchors = sectionIds.map(sectionScrollTop);
      schedule();
    };

    // The theme toggle swaps classes on <html>; tick colours follow it.
    const themeObserver = new MutationObserver(() => {
      readColors();
      schedule();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // The swell shows while scrolling, then eases back once scrolling stops.
    const onScroll = () => {
      scrolling = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        scrolling = false;
        schedule();
      }, SCROLL_IDLE);
      schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      hoverY = event.clientY;
      schedule();
    };
    const onPointerLeave = () => {
      hoverY = null;
      schedule();
    };

    measure();
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    // Fonts shift layout after first paint, which moves the sections.
    document.fonts?.ready.then(measure);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [sectionIds]);

  const setRef = (position: number) => (el: HTMLElement | null) => {
    tickRefs.current[position] = el;
  };

  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler-ticks" ref={ticksRef}>
        <canvas className="ruler-canvas" ref={canvasRef} />
        {ticks.map((tick) =>
          tick.kind === "long" ? (
            <button
              key={tick.position}
              ref={setRef(tick.position)}
              type="button"
              tabIndex={-1}
              className="ruler-tick"
              data-tone={tick.tone}
              onClick={() =>
                window.scrollTo({ top: sectionScrollTop(tick.section) })
              }
            />
          ) : (
            <span
              key={tick.position}
              ref={setRef(tick.position)}
              className="ruler-tick"
              data-tone={tick.tone}
            />
          ),
        )}
      </div>
      <div className="ruler-line" ref={lineRef} style={{ top: 0 }}>
        <a className="ruler-badge" href="#contact" tabIndex={-1}>
          Get in touch
        </a>
      </div>
    </div>
  );
}
