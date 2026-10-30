"use client";

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";

/**
 * How many checker columns each row keeps before it stops, so the panel
 * breaks off into a staggered checkerboard instead of a straight edge.
 */
const ROW_REACH = [5, 4, 3, 4, 3];
const COLS = Math.max(...ROW_REACH);

const CELLS = ROW_REACH.flatMap((reach, row) =>
  Array.from({ length: reach }, (_, col) => ({ col, row })).filter(
    ({ col, row }) => (col + row) % 2 === 0,
  ),
);

/** The outermost cube of each row turns to dust instead of staying solid. */
const EDGE_COLS = ROW_REACH.map((_, row) =>
  Math.max(...CELLS.filter((cell) => cell.row === row).map((cell) => cell.col)),
);
const SOLID_CELLS = CELLS.filter(({ col, row }) => col !== EDGE_COLS[row]);

const DUST_SPLIT = 4;
const DUST_SIZE = 1 / DUST_SPLIT;

// Seeded so the server and client render the same dust.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// One loop, in seconds: hold, crumble away, stay gone, rebuild.
const LOOP_SECONDS = 9.5;
const CRUMBLE_START = 1;
const CRUMBLE_SECONDS = 2.8;
const REBUILD_START = 7;
const REBUILD_SPREAD = 1.4;
const REBUILD_SECONDS = 0.6;

const DUST_LEFT = Math.min(...EDGE_COLS);
const DUST_RIGHT = Math.max(...EDGE_COLS) + 1;

const DUST = (() => {
  const random = seeded(7);
  return EDGE_COLS.flatMap((col, row) => {
    // Cubes start crumbling at different moments so the edge never moves as
    // one, and cubes further right go before the ones nearer the panel.
    const cubeDelay = (COLS - 1 - col) * 0.35 + random() * 0.8;
    return Array.from({ length: DUST_SPLIT * DUST_SPLIT }, (_, index) => {
      const ix = index % DUST_SPLIT;
      const iy = Math.floor(index / DUST_SPLIT);
      const x = col + ix * DUST_SIZE;

      // The right side of a cube goes first, like it is blown off.
      const crumbleAt =
        CRUMBLE_START +
        cubeDelay +
        (DUST_SPLIT - 1 - ix) * 0.18 +
        random() * 0.5;
      const goneAt = crumbleAt + CRUMBLE_SECONDS;
      // Rebuilding runs the other way, sweeping left to right.
      const rebuildAt =
        REBUILD_START +
        ((x - DUST_LEFT) / (DUST_RIGHT - DUST_LEFT)) * REBUILD_SPREAD +
        random() * 0.15;
      const at = (seconds: number) => seconds / LOOP_SECONDS;

      return {
        key: `${row}-${index}`,
        x,
        y: row + iy * DUST_SIZE,
        dx: 1.2 + random() * 3.3,
        dy: -1.6 + random() * 2.1,
        rot: Math.round((random() - 0.5) * 180),
        // Hold, crumble, snap home while invisible, wait, fade back in, hold.
        times: [
          0,
          at(crumbleAt),
          at(goneAt),
          at(goneAt + 0.01),
          at(rebuildAt),
          at(rebuildAt + REBUILD_SECONDS),
          1,
        ],
      };
    });
  });
})();

/** A solid brand block that asks for the fix after the verdict. */
export function FixCta({
  href,
  onFixClick,
  onRoastAnother,
}: {
  href: string;
  onFixClick: () => void;
  onRoastAnother: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex">
      <div className="w-full bg-foreground p-6 text-background brand:bg-[#ff4d00] brand:text-white sm:w-[62%] sm:p-8">
        <p className="font-mono text-xs tracking-wide uppercase opacity-80">
          Roasts are free
        </p>
        <p className="mt-2 text-2xl font-semibold text-balance sm:text-3xl">
          Brutal? Yes. Fixable? Also yes.
        </p>
        <p className="mt-2 max-w-md text-sm text-balance opacity-80">
          A site people trust pays for itself. I build fast, accessible websites
          that don&apos;t need a roast.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 brand:bg-white brand:text-[#ff4d00] brand:hover:bg-white/90"
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onFixClick}
            >
              Get it fixed
              <ArrowRightIcon />
            </a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="border border-current/40 bg-transparent text-inherit hover:border-current hover:bg-current/10 hover:text-inherit dark:hover:bg-current/10"
            onClick={onRoastAnother}
          >
            <RotateCcwIcon />
            Roast another
          </Button>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none relative z-1 flex-1 max-sm:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${COLS} ${ROW_REACH.length}`}
          preserveAspectRatio="xMinYMid meet"
          overflow="visible"
          className="absolute inset-y-0 left-0 h-full text-foreground brand:text-[#ff4d00]"
          style={{ aspectRatio: `${COLS} / ${ROW_REACH.length}` }}
        >
          {SOLID_CELLS.map(({ col, row }) => (
            <rect
              key={`${col}-${row}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill="currentColor"
              shapeRendering="crispEdges"
            />
          ))}
          {DUST.map(({ key, x, y, dx, dy, rot, times }) => (
            <motion.rect
              key={key}
              x={x}
              y={y}
              // A hair over size so neighbours overlap and the cube looks
              // solid until it starts to break up.
              width={DUST_SIZE + 0.01}
              height={DUST_SIZE + 0.01}
              fill="currentColor"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: [0, 0, dx, 0, 0, 0, 0],
                      y: [0, 0, dy, 0, 0, 0, 0],
                      rotate: [0, 0, rot, 0, 0, 0, 0],
                      opacity: [1, 1, 0, 0, 0, 1, 1],
                    }
              }
              transition={{
                duration: LOOP_SECONDS,
                times,
                ease: "easeIn",
                repeat: Infinity,
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
