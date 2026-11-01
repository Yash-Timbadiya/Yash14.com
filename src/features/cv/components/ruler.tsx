"use client";

import { useEffect, useRef } from "react";
import { WHATSAPP_MESSAGES } from "@/features/cv/data/cv";
import { WhatsAppLink } from "@/features/cv/components/whatsapp-link";

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

/**
 * On load the magnifier sweeps the ruler once, top to bottom, as if a
 * pointer were drawn down it. It starts and ends well past the ruler's ends
 * (the bell is ~3 reaches wide, so 8 rows clears it) and its strength fades
 * in and out over the first and last `fade` of the run, so the swell never
 * pops on or snaps off.
 */
const INTRO = { duration: 1600, overshoot: 8, fade: 0.22 };

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Fraction of the remaining distance covered each frame; lower is softer. */
const EASE = 0.2;

/** Matches the page's scroll-padding-top, for targets without a heading. */
const SECTION_OFFSET = 96;

/** Space between a section heading's box and the orange line under it. */
const HEADING_GAP = 14;

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

/**
 * Scroll position at which a section's heading sits just above the orange
 * line, given where the line is drawn (viewport px) when it rests on that
 * section's tick. Targets with neither a heading nor a marker land at the
 * top instead.
 */
function sectionScrollTop(id: string, lineY: number) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  // An explicit marker wins (the logo dot for the top of the page), else the
  // section's own heading. Scoped to direct children so #top, which wraps
  // every section, doesn't pick up Hello's heading.
  const heading =
    el.querySelector("[data-ruler-anchor]") ??
    el.querySelector(":scope > .section-title");
  const top = heading
    ? heading.getBoundingClientRect().bottom +
      window.scrollY -
      (lineY - HEADING_GAP)
    : el.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;
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
 * orange line sits on a section's tick when that section's heading rests
 * just above the line, and glides between ticks in between. Only long ticks
 * are clickable.
 */
export function Ruler({ sectionIds }: { sectionIds: string[] }) {
  const ticks = buildTicks(sectionIds);
  const rootRef = useRef<HTMLDivElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLElement | null)[]>([]);
  // Scroll targets per section, kept in sync by the effect's measure().
  const anchorsRef = useRef<number[]>([]);

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
    let rulerTop = 0;
    let colors: string[] = [];
    let dpr = 1;
    let hoverY: number | null = null;
    let scrolling = false;
    let scrollStrength = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let introStart: number | null = null;

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
      rulerTop = top;
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

      let introY: number | null = null;
      let introStrength = 0;
      if (introStart !== null) {
        const t = Math.min(
          1,
          (performance.now() - introStart) / INTRO.duration,
        );
        const span = (count - 1 + INTRO.overshoot * 2) * ROW;
        introY = top - INTRO.overshoot * ROW + easeInOutSine(t) * span;
        introStrength = smoothstep(
          Math.min(1, t / INTRO.fade, (1 - t) / INTRO.fade),
        );
        if (t >= 1) introStart = null;
        moving = true;
      }

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
            introY === null ? 0 : introStrength * bell(y - introY, HOVER),
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
      // Where the line sits when it rests on each section's long tick.
      anchors = sectionIds.map((id, index) =>
        sectionScrollTop(id, rulerTop + LINE_OFFSET + index * SPACING * ROW),
      );
      anchorsRef.current = anchors;
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

    // Menu links and other in-page links to a section land on the same spot
    // a ruler click does, heading resting on the line. When the ruler is
    // hidden on narrow screens, the browser's own anchor scroll takes over.
    const onLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      const index = link ? sectionIds.indexOf(link.hash.slice(1)) : -1;
      if (!link || index < 0 || !container.offsetParent) return;
      event.preventDefault();
      measure();
      window.scrollTo({ top: anchors[index] });
      history.pushState(null, "", link.hash);
    };

    measure();
    document.addEventListener("click", onLinkClick);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    // Fonts shift layout after first paint, which would make the line jump
    // to its real spot. The ruler stays hidden until they settle, then fades
    // in once it has been drawn in place.
    const reveal = () => {
      measure();
      requestAnimationFrame(() => {
        if (rootRef.current) rootRef.current.dataset.ready = "true";
        if (!reduceMotion) {
          introStart = performance.now();
          schedule();
        }
      });
    };
    if (document.fonts) {
      document.fonts.ready.then(reveal);
    } else {
      reveal();
    }

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      document.removeEventListener("click", onLinkClick);
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
    <div className="ruler" ref={rootRef} aria-hidden="true">
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
                window.scrollTo({
                  top: anchorsRef.current[tick.position / SPACING] ?? 0,
                })
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
        <WhatsAppLink
          className="ruler-badge"
          message={WHATSAPP_MESSAGES.contact}
          tabIndex={-1}
        >
          Get in touch
        </WhatsAppLink>
      </div>
    </div>
  );
}
