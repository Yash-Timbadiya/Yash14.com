"use client";

import { useEffect, useRef, useState } from "react";

const TICKS = 36;
const TICK_INDEXES = Array.from({ length: TICKS }, (_, i) => i);

/** Each tick sits in a row this tall, which is also its hover target. */
const ROW = 11;
const LENGTH = { minor: 30, major: 50 };

/** Every Nth minor tick is drawn a shade darker, like a ruler's half marks. */
const MID_EVERY = 4;

/**
 * Magnifier: ticks near the pointer are *scaled*, not lengthened by a fixed
 * amount, so a long section tick grows far more than a short one. `gain` is
 * the extra scale at the centre (2.6 → 3.6x) and `reach` the bell's spread
 * in px. A gentler one rides with the orange scroll indicator.
 */
const HOVER = { gain: 2.6, reach: 24 };
const SCROLL = { gain: 0.6, reach: 14 };

/** Fraction of the remaining distance covered each frame; lower is softer. */
const EASE = 0.2;

const bell = (distance: number, { gain, reach }: typeof HOVER) =>
  gain * Math.exp(-(distance * distance) / (2 * reach * reach));

/** Ends are ink, section starts grey, every Nth tick a shade darker. */
function toneOf(index: number, majors: number[]) {
  if (index === 0 || index === TICKS - 1) return "ink";
  if (majors.includes(index)) return "major";
  if (index % MID_EVERY === 0) return "mid";
  return undefined;
}

/**
 * Fixed reading ruler on the left edge. The orange line tracks scroll
 * progress down the ticks; longer ticks mark where each section starts.
 */
export function Ruler({ sectionIds }: { sectionIds: string[] }) {
  const ticksRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const majorsRef = useRef<Set<number>>(new Set());
  const [majors, setMajors] = useState<number[]>([]);

  useEffect(() => {
    const ticks = ticksRef.current;
    const line = lineRef.current;
    if (!ticks || !line) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const lengths = TICK_INDEXES.map(() => LENGTH.minor);
    let hoverY: number | null = null;
    let frame = 0;

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const found = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => {
          const top = el.getBoundingClientRect().top + window.scrollY - 96;
          return Math.round(Math.min(1, Math.max(0, top / max)) * (TICKS - 1));
        });
      majorsRef.current = new Set([0, TICKS - 1, ...found]);
      setMajors(found);
      schedule();
    };

    const tick = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      const rect = ticks.getBoundingClientRect();
      // Centre of the first and last rows, so the line lands on a tick.
      const top = rect.top + ROW / 2;
      const indicatorY = top + progress * (TICKS - 1) * ROW;
      line.style.transform = `translateY(${indicatorY}px)`;

      let moving = false;
      for (const i of TICK_INDEXES) {
        const y = top + i * ROW;
        const base = majorsRef.current.has(i) ? LENGTH.major : LENGTH.minor;
        const scale =
          1 +
          Math.max(
            hoverY === null ? 0 : bell(y - hoverY, HOVER),
            bell(y - indicatorY, SCROLL),
          );
        const target = base * scale;
        const next = reduceMotion
          ? target
          : lengths[i] + (target - lengths[i]) * EASE;
        const settled = Math.abs(target - next) < 0.1;
        if (!settled) moving = true;
        lengths[i] = settled ? target : next;

        tickRefs.current[i]?.style.setProperty(
          "--length",
          `${lengths[i].toFixed(2)}px`,
        );
      }

      if (moving) schedule();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      hoverY = event.clientY;
      schedule();
    };
    const onPointerLeave = () => {
      hoverY = null;
      schedule();
    };
    const onResize = measure;

    measure();
    ticks.addEventListener("pointermove", onPointerMove);
    ticks.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    // Fonts shift layout after first paint, which moves the section offsets.
    document.fonts?.ready.then(measure);

    return () => {
      cancelAnimationFrame(frame);
      ticks.removeEventListener("pointermove", onPointerMove);
      ticks.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [sectionIds]);

  const jumpTo = (index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (index / (TICKS - 1)) * max });
  };

  return (
    <div className="ruler" aria-hidden="true">
      <div className="ruler-ticks" ref={ticksRef}>
        {TICK_INDEXES.map((i) => (
          <button
            key={i}
            ref={(el) => {
              tickRefs.current[i] = el;
            }}
            type="button"
            tabIndex={-1}
            data-tone={toneOf(i, majors)}
            onClick={() => jumpTo(i)}
          />
        ))}
      </div>
      <div className="ruler-line" ref={lineRef} style={{ top: 0 }}>
        <a className="ruler-badge" href="#contact" tabIndex={-1}>
          Get in touch
        </a>
      </div>
    </div>
  );
}
