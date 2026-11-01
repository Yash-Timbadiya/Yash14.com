"use client";

import type { Transition } from "motion/react";

import { useSound } from "@/hooks/soundcn/use-sound";
import { useEffect, useId, useRef, useState } from "react";
import { metalClickSound } from "@/lib/soundcn/metal-click";
import {
  COS,
  OX,
  OY,
  SIN,
  ZUNIT,
} from "@/features/portfolio/components/yt-mark-isometric/constants";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * The homepage's isometric YT mark with only the mark itself: blocks that
 * rise on load, press down with a click sound, and an edge highlight that
 * follows the cursor. No traffic, guide lines or context menu.
 */

const GRID = [
  [true, true, true, true, false, true],
  [false, true, false, true, false, true],
  [false, true, false, false, true, false],
  [false, true, false, false, true, false],
];
const COLS = 6;
const ROWS = 4;

const TOP_NORMAL = 0.5;
const TOP_PRESSED = 0.25;

type Point = [number, number, number];

const project = ([fx, fy, isTop]: Point, topZ: number): [number, number] => [
  (fx - fy) * COS + OX,
  (fx + fy) * SIN - (isTop ? topZ : 0) * ZUNIT + OY,
];

const pathD = (points: Point[], topZ: number, close: boolean) =>
  `M${points
    .map((p) =>
      project(p, topZ)
        .map((n) => n.toFixed(2))
        .join(" "),
    )
    .join("L")}${close ? "Z" : ""}`;

const filled = (c: number, r: number) =>
  r >= 0 && r < ROWS && c >= 0 && c < COLS && GRID[r][c];
const eastExposed = (c: number, r: number) => filled(c, r) && !filled(c + 1, r);
const southExposed = (c: number, r: number) =>
  filled(c, r) && !filled(c, r + 1);

function buildGeometry() {
  const cells: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (GRID[r][c]) cells.push([c, r]);
    }
  }
  // Back to front, so nearer walls paint over farther ones.
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));

  const tops: Point[][] = [];
  const sides: Point[][] = [];
  for (const [c, r] of cells) {
    tops.push([
      [c, r, 1],
      [c + 1, r, 1],
      [c + 1, r + 1, 1],
      [c, r + 1, 1],
    ]);
    if (!filled(c + 1, r)) {
      sides.push([
        [c + 1, r, 1],
        [c + 1, r + 1, 1],
        [c + 1, r + 1, 0],
        [c + 1, r, 0],
      ]);
    }
    if (!filled(c, r + 1)) {
      sides.push([
        [c, r + 1, 1],
        [c + 1, r + 1, 1],
        [c + 1, r + 1, 0],
        [c, r + 1, 0],
      ]);
    }
  }

  const wallEdges = new Map<string, Point[]>();
  const topEdges = new Map<string, Point[]>();
  const addEdge = (a: Point, b: Point, map: Map<string, Point[]>) => {
    const [ka, kb] = [a.join(), b.join()];
    const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (!map.has(key)) map.set(key, [a, b]);
  };

  for (let x = 0; x <= COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (filled(x - 1, y) !== filled(x, y)) {
        addEdge([x, y, 1], [x, y + 1, 1], topEdges);
      }
    }
  }
  for (let y = 0; y <= ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (filled(x, y - 1) !== filled(x, y)) {
        addEdge([x, y, 1], [x + 1, y, 1], topEdges);
      }
    }
  }
  for (const [c, r] of cells) {
    if (!filled(c + 1, r)) {
      addEdge([c + 1, r, 0], [c + 1, r + 1, 0], wallEdges);
      if (!eastExposed(c, r - 1)) {
        addEdge([c + 1, r, 1], [c + 1, r, 0], wallEdges);
      }
      if (!eastExposed(c, r + 1)) {
        addEdge([c + 1, r + 1, 1], [c + 1, r + 1, 0], wallEdges);
      }
    }
    if (!filled(c, r + 1)) {
      addEdge([c, r + 1, 0], [c + 1, r + 1, 0], wallEdges);
      if (!southExposed(c - 1, r)) {
        addEdge([c, r + 1, 1], [c, r + 1, 0], wallEdges);
      }
      if (!southExposed(c + 1, r)) {
        addEdge([c + 1, r + 1, 1], [c + 1, r + 1, 0], wallEdges);
      }
    }
  }

  return {
    tops,
    sides,
    wallEdges: [...wallEdges.values()],
    topEdges: [...topEdges.values()],
  };
}

const GEO = buildGeometry();

type Shape = { normal: string; pressed: string };

const toShape = (points: Point[], close: boolean): Shape => ({
  normal: pathD(points, TOP_NORMAL, close),
  pressed: pathD(points, TOP_PRESSED, close),
});

const SIDES = GEO.sides.map((p) => toShape(p, true));
const TOPS = GEO.tops.map((p) => toShape(p, true));
const WALL_EDGES = GEO.wallEdges.map((e) => toShape(e, false));
const TOP_EDGES = GEO.topEdges.map((e) => toShape(e, false));

/** Tight box around the raised mark, with room for the hairlines. */
const VIEWBOX = (() => {
  const points = [...GEO.tops, ...GEO.sides]
    .flat()
    .map((p) => project(p, TOP_NORMAL));
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const pad = 2;
  const x = Math.floor(Math.min(...xs)) - pad;
  const y = Math.floor(Math.min(...ys)) - pad;
  return {
    x,
    y,
    w: Math.ceil(Math.max(...xs)) + pad - x,
    h: Math.ceil(Math.max(...ys)) + pad - y,
  };
})();

const SURFACE_FILL = "var(--background)";
const HIGHLIGHT_SPRING = { stiffness: 300, damping: 30, mass: 0.1 };

export function YTMarkCv() {
  const id = useId().replace(/:/g, "");
  const patternId = `yt-cv-hatch${id}`;
  const highlightId = `yt-cv-highlight${id}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(svgRef, { margin: "80px" });
  const reduceMotion = useReducedMotion();
  const [introReady, setIntroReady] = useState(false);
  const [play] = useSound(metalClickSound);

  // Edge highlight that follows the cursor across the whole window.
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const highlightCx = useSpring(
    useTransform(mouseX, [0, 1], [VIEWBOX.x, VIEWBOX.x + VIEWBOX.w]),
    HIGHLIGHT_SPRING,
  );
  const highlightCy = useSpring(
    useTransform(mouseY, [0, 1], [VIEWBOX.y, VIEWBOX.y + VIEWBOX.h]),
    HIGHLIGHT_SPRING,
  );

  useEffect(() => {
    if (reduceMotion) {
      setIntroReady(true);
      return;
    }
    // The server renders the pressed shape, so the mark shows from first
    // paint; it rises on the next frame after hydration.
    const frame = requestAnimationFrame(() => setIntroReady(true));
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !isInView) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [reduceMotion, isInView, mouseX, mouseY]);

  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", mass: 0.5, damping: 18, stiffness: 200 };

  const variantsFor = (shape: Shape) => ({
    normal: { d: shape.normal },
    pressed: { d: shape.pressed },
  });

  const renderShapes = (
    shapes: Shape[],
    key: string,
    props: React.ComponentProps<typeof motion.path>,
  ) =>
    shapes.map((shape) => (
      <motion.path
        key={`${key}${shape.normal}`}
        d={shape.normal}
        variants={variantsFor(shape)}
        transition={transition}
        {...props}
      />
    ));

  return (
    <motion.svg
      ref={svgRef}
      className="yt-mark-cv"
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
      // Left-aligned, vertically centred in the menu-height box cv.css gives it.
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      initial="pressed"
      animate={introReady ? "normal" : "pressed"}
      whileTap="pressed"
      onTap={() => play()}
    >
      <defs>
        <motion.radialGradient
          id={highlightId}
          cx={highlightCx}
          cy={highlightCy}
          r="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop className="yt-mark-cv-glow" />
          <stop className="yt-mark-cv-glow-end" offset="1" stopOpacity="0" />
        </motion.radialGradient>
        <pattern
          id={patternId}
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <rect width="10" height="10" fill={SURFACE_FILL} />
          <path
            d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <g>
        {renderShapes(SIDES, "side", { fill: SURFACE_FILL })}
        {renderShapes(WALL_EDGES, "wall", {
          stroke: "var(--stroke)",
          strokeWidth: 1,
        })}
        {renderShapes(WALL_EDGES, "wall-glow", {
          stroke: `url(#${highlightId})`,
          strokeWidth: 1,
        })}
        {renderShapes(TOPS, "top", { fill: SURFACE_FILL })}
        {renderShapes(TOPS, "top-hatch", { fill: `url(#${patternId})` })}
        {renderShapes(TOP_EDGES, "top-edge", {
          stroke: "var(--stroke)",
          strokeWidth: 1,
        })}
        {renderShapes(TOP_EDGES, "top-glow", {
          stroke: `url(#${highlightId})`,
          strokeWidth: 1,
        })}
      </g>
    </motion.svg>
  );
}
