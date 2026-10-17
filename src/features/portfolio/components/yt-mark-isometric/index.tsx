"use client";

import type { Transition } from "motion/react";

import { trackEvent } from "@/lib/analytics";
import { useSound } from "@/hooks/soundcn/use-sound";
import { useEffect, useId, useRef, useState } from "react";
import { metalClickSound } from "@/lib/soundcn/metal-click";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const GRID = [
  [true, true, true, true, false, true],
  [false, true, false, true, false, true],
  [false, true, false, false, true, false],
  [false, true, false, false, true, false],
];

const COLS = 6;
const ROWS = 4;

import {
  CAR_MODEL_NAMES,
  type CarModel,
  CarPreview,
  VehicleShape,
} from "./car-models";

const CAR_MODELS: CarModel[] = ["detailed", "supercar", "f1", "truck"];

import { COS, OX, OY, SIN, ZUNIT } from "./constants";

// True isometric (30°) projection constants.

const TOP_NORMAL = 0.5;
const TOP_PRESSED = 0.25;

type Point = [number, number, number];

function projectPoint([fx, fy, isTop]: Point, topZ: number) {
  const z = isTop ? topZ : 0;
  const x = (fx - fy) * COS + OX;
  const y = (fx + fy) * SIN - z * ZUNIT + OY;
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

function pathD(points: Point[], topZ: number, close: boolean) {
  return `M${points.map((p) => projectPoint(p, topZ)).join("L")}${close ? "Z" : ""}`;
}

const filled = (c: number, r: number) =>
  r >= 0 && r < ROWS && c >= 0 && c < COLS && GRID[r][c];
const eastExposed = (c: number, r: number) => filled(c, r) && !filled(c + 1, r);
const southExposed = (c: number, r: number) =>
  filled(c, r) && !filled(c, r + 1);

type Geometry = {
  sideFills: Point[][];
  sideFillsBehindTraffic: Point[][];
  topFills: Point[][];
  wallEdges: Point[][];
  wallEdgesBehindTraffic: Point[][];
  topEdges: Point[][];
};

function buildGeometry(): Geometry {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (GRID[r][c]) cells.push([c, r]);
    }
  }

  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));

  const topFills: Point[][] = [];
  const sideFills: Point[][] = [];
  const sideFillsBehindTraffic: Point[][] = [];
  for (const [c, r] of cells) {
    topFills.push([
      [c, r, 1],
      [c + 1, r, 1],
      [c + 1, r + 1, 1],
      [c, r + 1, 1],
    ]);
    if (!filled(c + 1, r)) {
      sideFills.push([
        [c + 1, r, 1],
        [c + 1, r + 1, 1],
        [c + 1, r + 1, 0],
        [c + 1, r, 0],
      ]);
    }
    if (!filled(c, r + 1)) {
      const wall: Point[] = [
        [c, r + 1, 1],
        [c + 1, r + 1, 1],
        [c + 1, r + 1, 0],
        [c, r + 1, 0],
      ];
      if (r === ROWS - 1) {
        sideFillsBehindTraffic.push(wall);
      } else {
        sideFills.push(wall);
      }
    }
  }

  const wallEdgeMap = new Map<string, Point[]>();
  const wallEdgeBehindTrafficMap = new Map<string, Point[]>();
  const topEdgeMap = new Map<string, Point[]>();
  const keyOf = (p: Point) => p.join(",");
  const addEdge = (
    a: Point,
    b: Point,
    layer: "wall" | "top",
    behindTraffic = false,
  ) => {
    const ka = keyOf(a);
    const kb = keyOf(b);
    const key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (layer === "top") {
      if (!topEdgeMap.has(key)) topEdgeMap.set(key, [a, b]);
      return;
    }
    const map = behindTraffic ? wallEdgeBehindTrafficMap : wallEdgeMap;
    if (!map.has(key)) map.set(key, [a, b]);
  };

  for (let x = 0; x <= COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (filled(x - 1, y) !== filled(x, y))
        addEdge([x, y, 1], [x, y + 1, 1], "top");
    }
  }
  for (let y = 0; y <= ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (filled(x, y - 1) !== filled(x, y))
        addEdge([x, y, 1], [x + 1, y, 1], "top");
    }
  }

  for (const [c, r] of cells) {
    const southBehindTraffic = r === ROWS - 1;
    if (!filled(c + 1, r)) {
      addEdge([c + 1, r, 0], [c + 1, r + 1, 0], "wall");
      if (!eastExposed(c, r - 1)) addEdge([c + 1, r, 1], [c + 1, r, 0], "wall");
      if (!eastExposed(c, r + 1))
        addEdge([c + 1, r + 1, 1], [c + 1, r + 1, 0], "wall");
    }
    if (!filled(c, r + 1)) {
      addEdge([c, r + 1, 0], [c + 1, r + 1, 0], "wall", southBehindTraffic);
      if (!southExposed(c - 1, r))
        addEdge([c, r + 1, 1], [c, r + 1, 0], "wall", southBehindTraffic);
      if (!southExposed(c + 1, r))
        addEdge(
          [c + 1, r + 1, 1],
          [c + 1, r + 1, 0],
          "wall",
          southBehindTraffic,
        );
    }
  }

  return {
    topFills,
    sideFills,
    sideFillsBehindTraffic,
    wallEdges: [...wallEdgeMap.values()],
    wallEdgesBehindTraffic: [...wallEdgeBehindTrafficMap.values()],
    topEdges: [...topEdgeMap.values()],
  };
}

const GEO = buildGeometry();

type Shape = { normal: string; pressed: string };

const toShape = (points: Point[], close: boolean): Shape => ({
  normal: pathD(points, TOP_NORMAL, close),
  pressed: pathD(points, TOP_PRESSED, close),
});

const SIDE_FILLS = GEO.sideFills.map((p) => toShape(p, true));
const SIDE_FILLS_BEHIND_TRAFFIC = GEO.sideFillsBehindTraffic.map((p) =>
  toShape(p, true),
);
const TOP_FILLS = GEO.topFills.map((p) => toShape(p, true));
const WALL_EDGES = GEO.wallEdges.map((e) => toShape(e, false));
const WALL_EDGES_BEHIND_TRAFFIC = GEO.wallEdgesBehindTraffic.map((e) =>
  toShape(e, false),
);
const TOP_EDGES = GEO.topEdges.map((e) => toShape(e, false));

const SURFACE_FILL = "var(--background)";

const GUIDE_LINES = [
  "M-700 879L1230 -237",
  "M-700 751L1230 -365",
  "M-700 620L1230 -489",
  "M-700 -282L1300 873",
  "M-700 -348L1300 811",
  "M-700 -474L1300 680.5",
  "M-700 -542L1300 619",
];

const GUIDE_DASH = "4 2";
const GUIDE_DASH_PERIOD = 6;

const guideLineTransition: Transition = {
  repeat: Infinity,
  duration: 0.7,
  ease: "linear",
};

const BAND_0 = {
  top: "M-700 -542L1300 619",
  bottom: "M-700 -474L1300 680.5",
} as const;
const BAND_FILL = `${BAND_0.top}L1300 680.5L-700 -474Z`;
const BAND_1 = {
  top: "M-700 -348L1300 811",
  bottom: "M-700 -282L1300 873",
} as const;
const BAND_FILL_2 = `${BAND_1.top}L1300 873L-700 -282Z`;

const BAND_FILL_OPACITY = 0.08;
const BAND_FILL_FEATHER = 0.22;

const VIEWBOX = { x: -31, y: -20, w: 617, h: 315 };
const PATH_PAD = 45;
const PATH_RUNOUT = 240;

type BandPath = {
  start: [number, number];
  dir: [number, number];
  dist: number;
};

function parseBandLine(d: string): [[number, number], [number, number]] {
  const m = d.match(/^M([-\d.]+)\s+([-\d.]+)L([-\d.]+)\s+([-\d.]+)/);
  if (!m) throw new Error(`Invalid band line: ${d}`);
  return [
    [Number(m[1]), Number(m[2])],
    [Number(m[3]), Number(m[4])],
  ];
}

function bandGradientAxis(top: string, bottom: string) {
  const [t0, t1] = parseBandLine(top);
  const [b0, b1] = parseBandLine(bottom);
  return {
    x1: (t0[0] + b0[0]) / 2,
    y1: (t0[1] + b0[1]) / 2,
    x2: (t1[0] + b1[0]) / 2,
    y2: (t1[1] + b1[1]) / 2,
  };
}

const BAND_GRAD_0 = bandGradientAxis(BAND_0.top, BAND_0.bottom);
const BAND_GRAD_1 = bandGradientAxis(BAND_1.top, BAND_1.bottom);

function bandTrafficPath(
  top: string,
  bottom: string,
  view = VIEWBOX,
  pad = PATH_PAD,
  runout = PATH_RUNOUT,
): BandPath {
  const [t0, t1] = parseBandLine(top);
  const [b0, b1] = parseBandLine(bottom);
  const c0: [number, number] = [(t0[0] + b0[0]) / 2, (t0[1] + b0[1]) / 2];
  const c1: [number, number] = [(t1[0] + b1[0]) / 2, (t1[1] + b1[1]) / 2];
  const dx = c1[0] - c0[0];
  const dy = c1[1] - c0[1];
  const fullLen = Math.hypot(dx, dy);
  const dir: [number, number] = [dx / fullLen, dy / fullLen];

  const yMin = view.y - pad;
  const yMax = view.y + view.h + pad;
  const tStart = Math.max(0, Math.min(1, (yMin - c0[1]) / dy));
  const tEnd = Math.max(0, Math.min(1, (yMax - c0[1]) / dy));
  const lo = Math.max(0, Math.min(tStart, tEnd) - runout / fullLen);
  const hi = Math.min(1, Math.max(tStart, tEnd) + runout / fullLen);

  return {
    start: [c0[0] + lo * dx, c0[1] + lo * dy],
    dir,
    dist: (hi - lo) * fullLen,
  };
}

const TRAFFIC_BANDS: BandPath[] = [
  bandTrafficPath(BAND_0.top, BAND_0.bottom),
  bandTrafficPath(BAND_1.top, BAND_1.bottom),
];

type VehicleSpec = {
  kind: "car";
  band: number;
  phase: number;
  duration: number;
};
const TRAFFIC: VehicleSpec[] = [
  { kind: "car", band: 0, phase: 0.0, duration: 5 },
  { kind: "car", band: 0, phase: 0.4, duration: 5 },
  { kind: "car", band: 1, phase: 0.15, duration: 4.5 },
  { kind: "car", band: 1, phase: 0.63, duration: 4.5 },
];

function vehicleTranslate(band: BandPath, phase: number) {
  const [sx, sy] = band.start;
  return {
    x: sx + phase * band.dist * band.dir[0],
    y: sy + phase * band.dist * band.dir[1],
  };
}

function Vehicle({
  spec,
  reduce,
  animateTraffic,
  model,
}: {
  spec: VehicleSpec;
  reduce: boolean | null;
  animateTraffic: boolean;
  model: CarModel;
}) {
  const band = TRAFFIC_BANDS[spec.band];
  const [sx, sy] = band.start;
  const ex = sx + band.dist * band.dir[0];
  const ey = sy + band.dist * band.dir[1];

  if (reduce || !animateTraffic) {
    const { x, y } = vehicleTranslate(band, spec.phase);
    return (
      <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
        <VehicleShape kind={spec.kind} model={model} />
      </g>
    );
  }

  const loop = {
    duration: spec.duration,
    ease: "linear" as const,
    repeat: Number.POSITIVE_INFINITY,
  };

  const elapsed = spec.phase * spec.duration;

  return (
    <motion.g
      initial={{ x: sx, y: sy }}
      animate={{ x: [sx, ex], y: [sy, ey] }}
      transition={{
        x: { ...loop, delay: -elapsed },
        y: { ...loop, delay: -elapsed },
      }}
    >
      <VehicleShape kind={spec.kind} model={model} />
    </motion.g>
  );
}

const bandRevealTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

type YTMarkIsometricProps = {
  onActivate?: () => void;
};

const HIGHLIGHT_SPRING = { stiffness: 300, damping: 30, mass: 0.1 };

export function YTMarkIsometric({ onActivate }: YTMarkIsometricProps) {
  const patternId = `yt-hatch${useId().replace(/:/g, "")}`;
  const bandId0 = `yt-band-0${useId().replace(/:/g, "")}`;
  const bandId1 = `yt-band-1${useId().replace(/:/g, "")}`;
  const bandClipId = `yt-band-clip${useId().replace(/:/g, "")}`;
  const highlightId = `yt-edge-highlight${useId().replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const isInView = useInView(svgRef, { margin: "80px" });

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
  const reduceMotion = useReducedMotion();
  const [animateTraffic, setAnimateTraffic] = useState(false);
  const [active, setActive] = useState(false);
  const [carModel, setCarModel] = useState<CarModel>("detailed");
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    if (reduceMotion === false) {
      setAnimateTraffic(true);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setIntroReady(true);
      return;
    }

    const markTimer = window.setTimeout(() => setIntroReady(true), 450);

    return () => window.clearTimeout(markTimer);
  }, [reduceMotion]);

  useEffect(() => {
    // Only listen while the mark is on screen, and skip touch-only devices.
    if (reduceMotion || !isInView) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion, isInView, mouseX, mouseY]);

  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : {
        type: "spring",
        mass: 0.5,
        damping: 18,
        stiffness: 200,
      };

  const [play] = useSound(metalClickSound);

  const variantsFor = (shape: Shape) => ({
    normal: { d: shape.normal },
    pressed: { d: shape.pressed },
  });

  const bandTransition = reduceMotion ? { duration: 0 } : bandRevealTransition;

  const bandFillSweepDuration = 4;
  const bandFillSweepEase = [0.22, 1, 0.36, 1] as const;

  const bandFillSweepTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: bandFillSweepDuration, ease: bandFillSweepEase };

  const bandFillProgress = active ? [0, 1] : [1, 0];
  const bandFillTailProgress = active
    ? [BAND_FILL_FEATHER, 1 + BAND_FILL_FEATHER]
    : [1 + BAND_FILL_FEATHER, BAND_FILL_FEATHER];

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) {
          trackEvent(ANALYTICS_EVENTS.YT_MARK_RIGHT_CLICK, {
            section: ANALYTICS_SECTIONS.PROFILE_HEADER,
            traffic: active ? "on" : "off",
            car: CAR_MODEL_NAMES[carModel],
          });
        }
      }}
    >
      <ContextMenuTrigger asChild>
        <motion.svg
          ref={svgRef}
          className="relative isolate h-auto w-full touch-manipulation overflow-visible cursor-pointer transition-all duration-300 [--pattern:color-mix(in_oklab,var(--foreground)_12%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_16%,var(--background))]"
          viewBox="-31 -20 617 315"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          initial="pressed"
          animate={introReady ? "normal" : "pressed"}
          whileTap="pressed"
          onTap={() => {
            play();
            trackEvent(ANALYTICS_EVENTS.YT_MARK_CLICK, {
              section: ANALYTICS_SECTIONS.PROFILE_HEADER,
              traffic: active ? "off" : "on",
              car: CAR_MODEL_NAMES[carModel],
            });
            setActive((on) => !on);
            onActivate?.();
          }}
        >
          <defs>
            <motion.radialGradient
              id={highlightId}
              cx={highlightCx}
              cy={highlightCy}
              r="200"
              gradientUnits="userSpaceOnUse"
            >
              <stop
                className="dark:[stop-color:#fff]"
                stopColor="var(--color-zinc-700)"
              />
              <stop
                className="dark:[stop-color:var(--color-zinc-600)]"
                offset="1"
                stopColor="var(--color-zinc-400)"
                stopOpacity="0"
              />
            </motion.radialGradient>
            <pattern
              id={patternId}
              x="0"
              y="0"
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

            <motion.linearGradient
              id={bandId0}
              gradientUnits="userSpaceOnUse"
              x1={BAND_GRAD_0.x1}
              y1={BAND_GRAD_0.y1}
              x2={BAND_GRAD_0.x2}
              y2={BAND_GRAD_0.y2}
            >
              <motion.stop
                offset={0}
                stopColor="var(--foreground)"
                stopOpacity={0}
                initial={{
                  offset: bandFillProgress[0],
                  stopOpacity: active ? 0 : BAND_FILL_OPACITY,
                }}
                animate={{
                  stopOpacity: active
                    ? [0, BAND_FILL_OPACITY]
                    : [BAND_FILL_OPACITY, 0],
                  offset: bandFillProgress,
                }}
                transition={bandFillSweepTransition}
              />
              <motion.stop
                offset={BAND_FILL_FEATHER}
                stopColor="var(--foreground)"
                stopOpacity={0}
                initial={{ offset: bandFillTailProgress[0] }}
                animate={{ offset: bandFillTailProgress }}
                transition={bandFillSweepTransition}
              />
              <stop
                offset="100%"
                stopColor="var(--foreground)"
                stopOpacity={0}
              />
            </motion.linearGradient>
            <motion.linearGradient
              id={bandId1}
              gradientUnits="userSpaceOnUse"
              x1={BAND_GRAD_1.x1}
              y1={BAND_GRAD_1.y1}
              x2={BAND_GRAD_1.x2}
              y2={BAND_GRAD_1.y2}
            >
              <motion.stop
                offset={0}
                stopColor="var(--foreground)"
                stopOpacity={0}
                initial={{
                  offset: bandFillProgress[0],
                  stopOpacity: active ? 0 : BAND_FILL_OPACITY,
                }}
                animate={{
                  stopOpacity: active
                    ? [0, BAND_FILL_OPACITY]
                    : [BAND_FILL_OPACITY, 0],
                  offset: bandFillProgress,
                }}
                transition={bandFillSweepTransition}
              />
              <motion.stop
                offset={BAND_FILL_FEATHER}
                stopColor="var(--foreground)"
                stopOpacity={0}
                initial={{ offset: bandFillTailProgress[0] }}
                animate={{ offset: bandFillTailProgress }}
                transition={bandFillSweepTransition}
              />
              <stop
                offset="100%"
                stopColor="var(--foreground)"
                stopOpacity={0}
              />
            </motion.linearGradient>

            <clipPath id={bandClipId}>
              <path d={BAND_FILL} />
              <path d={BAND_FILL_2} />
            </clipPath>
          </defs>

          <AnimatePresence>
            <motion.g
              key="corridors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={bandTransition}
            >
              <motion.path
                d={BAND_FILL}
                fill={`url(#${bandId0})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={bandTransition}
              />
              <motion.path
                d={BAND_FILL_2}
                fill={`url(#${bandId1})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={bandTransition}
              />
              <g className="stroke-line">
                {GUIDE_LINES.map((d) => (
                  <motion.path
                    key={d}
                    d={d}
                    stroke="var(--line)"
                    strokeWidth={1}
                    strokeDasharray={GUIDE_DASH}
                    initial={{ strokeDashoffset: 0, opacity: 0 }}
                    animate={{
                      strokeDashoffset: reduceMotion ? 0 : -GUIDE_DASH_PERIOD,
                      opacity: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: bandTransition,
                      strokeDashoffset: reduceMotion
                        ? undefined
                        : guideLineTransition,
                    }}
                  />
                ))}
              </g>
            </motion.g>
          </AnimatePresence>

          <g
            className={`transition-opacity duration-200 motion-reduce:transition-none ${
              introReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {SIDE_FILLS_BEHIND_TRAFFIC.map((shape, i) => (
              <motion.path
                key={`side-behind-${i}`}
                d={shape.normal}
                fill={SURFACE_FILL}
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
            {WALL_EDGES_BEHIND_TRAFFIC.map((shape, i) => (
              <motion.path
                key={`wall-edge-behind-${i}`}
                d={shape.normal}
                stroke="var(--stroke)"
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
            {WALL_EDGES_BEHIND_TRAFFIC.map((shape, i) => (
              <motion.path
                key={`wall-edge-behind-highlight-${i}`}
                d={shape.normal}
                stroke={`url(#${highlightId})`}
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}

            {active ? (
              <AnimatePresence>
                <motion.g
                  key="traffic"
                  className="[--v-front:color-mix(in_oklab,var(--foreground)_13%,var(--background))] [--v-side:color-mix(in_oklab,var(--foreground)_7%,var(--background))] [--v-stroke:color-mix(in_oklab,var(--foreground)_36%,var(--background))] [--v-top:color-mix(in_oklab,var(--foreground)_21%,var(--background))] [--v-wheel:color-mix(in_oklab,var(--foreground)_30%,var(--background))] [--v-wheel-side:color-mix(in_oklab,var(--foreground)_40%,var(--background))] [--v-wheel-front:color-mix(in_oklab,var(--foreground)_45%,var(--background))] [--v-wheel-top:color-mix(in_oklab,var(--foreground)_50%,var(--background))] [--v-window:color-mix(in_oklab,var(--foreground)_60%,var(--background))] [--v-bumper:color-mix(in_oklab,var(--foreground)_25%,var(--background))] [--v-light-front:color-mix(in_oklab,var(--foreground)_85%,var(--background))]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={bandTransition}
                >
                  {TRAFFIC.map((spec, i) => (
                    <Vehicle
                      key={i}
                      spec={spec}
                      reduce={reduceMotion}
                      animateTraffic={animateTraffic}
                      model={carModel}
                    />
                  ))}
                </motion.g>
              </AnimatePresence>
            ) : null}

            {SIDE_FILLS.map((shape, i) => (
              <motion.path
                key={`side-${i}`}
                d={shape.normal}
                fill={SURFACE_FILL}
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}

            {WALL_EDGES.map((shape, i) => (
              <motion.path
                key={`wall-edge-${i}`}
                d={shape.normal}
                stroke="var(--stroke)"
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
            {WALL_EDGES.map((shape, i) => (
              <motion.path
                key={`wall-edge-highlight-${i}`}
                d={shape.normal}
                stroke={`url(#${highlightId})`}
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}

            {TOP_FILLS.map((shape, i) => (
              <motion.path
                key={`top-bg-${i}`}
                d={shape.normal}
                fill={SURFACE_FILL}
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
            {TOP_FILLS.map((shape, i) => (
              <motion.path
                key={`top-pattern-${i}`}
                d={shape.normal}
                fill={`url(#${patternId})`}
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}

            {TOP_EDGES.map((shape, i) => (
              <motion.path
                key={`top-edge-${i}`}
                d={shape.normal}
                stroke="var(--stroke)"
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
            {TOP_EDGES.map((shape, i) => (
              <motion.path
                key={`top-edge-highlight-${i}`}
                d={shape.normal}
                stroke={`url(#${highlightId})`}
                strokeWidth="1"
                variants={variantsFor(shape)}
                transition={transition}
              />
            ))}
          </g>
        </motion.svg>
      </ContextMenuTrigger>
      <ContextMenuContent className="p-1.5 grid grid-cols-2 gap-1.5 rounded-xl border-dashed border-2 border-neutral-400 bg-neutral-200/90 backdrop-blur-md shadow-xl ring-1 shadow-black/5 ring-black/5 dark:border-neutral-700 dark:bg-zinc-900">
        {CAR_MODELS.map((model) => (
          <ContextMenuItem
            key={model}
            asChild
            onSelect={() => {
              trackEvent(ANALYTICS_EVENTS.CAR_MODEL_CHANGED, {
                section: ANALYTICS_SECTIONS.PROFILE_HEADER,
                from: CAR_MODEL_NAMES[carModel],
                to: CAR_MODEL_NAMES[model],
                traffic: active ? "on" : "off",
              });
              setCarModel(model);
            }}
          >
            <div
              className={`p-1.5 rounded-xl border-2 transition-all duration-200 cursor-default select-none shadow-[0px_-1px_0px_0px_var(--color-line)_inset] dark:shadow-[0px_-1px_0px_0px_var(--color-line)_inset]
           ${
             carModel === model
               ? "bg-background border-neutral-400 dark:border-neutral-700 shadow-md pointer-events-none dark:bg-background"
               : "bg-background/40 border-neutral-400/60 hover:bg-background/80 hover:border-neutral-400 opacity-70 hover:opacity-90 dark:border-neutral-700/60 dark:hover:border-neutral-700"
           }
           `}
            >
              <CarPreview model={model} selected={carModel === model} />
            </div>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
