import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const COLUMNS = 16;
const ROWS = 5;
/** Sixteen wide, minus the eight by four clear space behind the copy. */
const CELL_COUNT = COLUMNS * ROWS - 8 * 4;

/** A piece of a shape: its centre and size, in fourteenths of a cell. */
type Piece = readonly [x: number, y: number, w: number, h: number];

/** The square every shape grows from, and the dot it collapses to. */
const SEED = 1.5;
const DOT = 0.35;

/** The YT mark on its 6 x 4 grid, as drawn in `yt-mark.tsx`. */
const MARK = [
  [1, 0, 1, 1, 1, 1],
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 0],
];

function grid(count: number, gap: number, size: number): Piece[] {
  const start = (-(count - 1) * gap) / 2;
  return Array.from({ length: count * count }, (_, index) => [
    start + (index % count) * gap,
    start + Math.floor(index / count) * gap,
    size,
    size,
  ]);
}

function mark(): Piece[] {
  return MARK.flatMap((cols, row) =>
    cols.flatMap((filled, col): Piece[] =>
      filled ? [[(col - 2.5) * 1.25, (row - 1.5) * 1.25, 0.95, 0.95]] : [],
    ),
  );
}

/** Two bars per line, like a skeleton of text. */
function lines(): Piece[] {
  const rows = [
    [-2, 3.6, 1.6],
    [-1, 4.2, 1.2],
    [0, 2.4, 2.2],
    [1, 3.8, 1.4],
    [2, 2.8, 1],
  ] as const;
  return rows.flatMap(([y, first, second]): Piece[] => [
    [-3 + first / 2, y, first, 0.45],
    [-3 + first + 0.3 + second / 2, y, second, 0.45],
  ]);
}

const SHAPES = {
  grid3: grid(3, 1.7, 1.1),
  grid2: grid(2, 1.8, 1.3),
  mark: mark(),
  lines: lines(),
  stairs: [
    [-2.4, -2.4, 1.1, 1.1],
    [-0.8, -0.8, 1.1, 1.1],
    [0.8, 0.8, 1.1, 1.1],
    [2.4, 2.4, 1.1, 1.1],
    [2.4, -2.4, 0.6, 0.6],
    [-2.4, 2.4, 0.6, 0.6],
  ],
} satisfies Record<string, Piece[]>;

type Shape = keyof typeof SHAPES | "tree";

/** Where a tree node sits in one stage: centre and size. Size 0 hides it. */
type Spot = readonly [x: number, y: number, size: number];

/**
 * Each node's spot in the four stages: a lone square, a small tree, a wider
 * one with longer arms, then a diamond hanging off the root. A node that is
 * not out yet waits, at size 0, on the node it will grow from.
 */
const TREE_NODES: Record<string, readonly [Spot, Spot, Spot, Spot]> = {
  root: [
    [0, 0, 1.3],
    [0, -1.4, 1.7],
    [0, -2.4, 2.2],
    [0, -3, 1.8],
  ],
  l1: [
    [0, 0, 0],
    [-1.9, 0.7, 0.9],
    [-2.2, -0.4, 1.1],
    [-1.8, -1.3, 0.9],
  ],
  r1: [
    [0, 0, 0],
    [1.9, 0.7, 0.9],
    [2.2, -0.4, 1.1],
    [1.8, -1.3, 0.9],
  ],
  l2: [
    [0, 0, 0],
    [-1.9, 0.7, 0],
    [-4, 1.4, 1.1],
    [-3.2, 0.2, 0.9],
  ],
  r2: [
    [0, 0, 0],
    [1.9, 0.7, 0],
    [4, 1.4, 1.1],
    [3.2, 0.2, 0.9],
  ],
  l3: [
    [0, 0, 0],
    [-1.9, 0.7, 0],
    [-4, 1.4, 0],
    [-1.8, 1.7, 0.9],
  ],
  r3: [
    [0, 0, 0],
    [1.9, 0.7, 0],
    [4, 1.4, 0],
    [1.8, 1.7, 0.9],
  ],
};

/** Links from a node to the one that grows out of it. */
const TREE_LINKS = [
  ["root", "l1"],
  ["l1", "l2"],
  ["l2", "l3"],
  ["root", "r1"],
  ["r1", "r2"],
  ["r2", "r3"],
] as const;

const STAGES = [0, 1, 2, 3] as const;

/** Faint crop marks around each square, this far out from its edge. */
const TICK_GAP = 0.45;
const TICKS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

const TREE_FILL = "bg-[color-mix(in_oklab,var(--ink)_11%,var(--paper))]";
const TREE_ANIMATION =
  "motion-safe:animate-[tree-node_6s_cubic-bezier(0.8,0,0.2,1)_infinite]";
const LINK_ANIMATION =
  "motion-safe:animate-[tree-link_6s_cubic-bezier(0.8,0,0.2,1)_infinite]";

/** The link's start, angle and length in each stage. */
function linkStages(from: string, to: string) {
  const stages = STAGES.map((stage) => {
    const [x0, y0, size0] = TREE_NODES[from][stage];
    const [x1, y1, size1] = TREE_NODES[to][stage];
    const length = size0 && size1 ? Math.hypot(x1 - x0, y1 - y0) : 0;
    return { x: x0, y: y0, length, angle: Math.atan2(y1 - y0, x1 - x0) };
  });
  // A hidden link takes the angle it will have once it shows, so it never
  // spins on the way in or out.
  const shown = stages.find((stage) => stage.length > 0);
  return stages.map((stage) =>
    stage.length > 0 ? stage : { ...stage, angle: shown?.angle ?? 0 },
  );
}

/**
 * Grows in four stages, one snap after another: a lone square rises into a
 * small tree, its arms stretch out, then fold round into a diamond under
 * the root. It then folds straight back into the lone square.
 */
function TreeShape({ cell }: { cell: number }) {
  const delay = `${-cell * 630}ms`;
  return (
    <>
      {TREE_LINKS.map(([from, to]) => {
        const style: Record<string, number | string> = {
          animationDelay: delay,
        };
        linkStages(from, to).forEach((stage, index) => {
          style[`--lx${index}`] = stage.x;
          style[`--ly${index}`] = stage.y;
          style[`--la${index}`] = (stage.angle * 180) / Math.PI;
          style[`--ll${index}`] = stage.length;
        });
        return (
          <span
            key={`${from}-${to}`}
            className={cn(
              "absolute top-[calc(50%+var(--ly)*var(--u))] left-[calc(50%+var(--lx)*var(--u))] h-px w-(--u) origin-left transform-[rotate(calc(var(--la)*1deg))_scaleX(var(--ll))] [--la:var(--la3)] [--ll:var(--ll3)] [--lx:var(--lx3)] [--ly:var(--ly3)]",
              TREE_FILL,
              LINK_ANIMATION,
            )}
            style={style as CSSProperties}
          />
        );
      })}
      {Object.entries(TREE_NODES).map(([name, spots]) => {
        const style: Record<string, number | string> = {
          animationDelay: delay,
        };
        spots.forEach(([x, y, size], index) => {
          style[`--x${index}`] = x;
          style[`--y${index}`] = y;
          style[`--s${index}`] = size;
        });
        return (
          <span
            key={name}
            className={cn(
              "absolute top-[calc(50%+var(--hy)*var(--u))] left-[calc(50%+var(--hx)*var(--u))] [--hs:var(--s3)] [--hx:var(--x3)] [--hy:var(--y3)]",
              TREE_ANIMATION,
            )}
            style={style as CSSProperties}
          >
            <span
              className={cn(
                "absolute size-[calc(var(--hs)*var(--u))] -translate-1/2 rounded-[1px]",
                TREE_FILL,
              )}
            />
            {TICKS.map(([sx, sy]) => (
              <span
                key={`${sx}${sy}`}
                className="absolute size-0.5 -translate-1/2 bg-ink/10 opacity-[calc(var(--hs)*3)]"
                style={{
                  left: `calc(${sx} * (var(--hs) / 2 + ${TICK_GAP}) * var(--u))`,
                  top: `calc(${sy} * (var(--hs) / 2 + ${TICK_GAP}) * var(--u))`,
                }}
              />
            ))}
          </span>
        );
      })}
    </>
  );
}

/**
 * Cell indexes that morph through a shape instead of showing a dot. Kept off
 * the cells under the corner tags (2, 13, 42 and 45), so the labels stay
 * readable.
 */
const SHAPE_CELLS = new Map<number, Shape>([
  [3, "grid3"],
  [6, "mark"],
  [9, "grid2"],
  [12, "stairs"],
  [17, "tree"],
  [22, "lines"],
  [26, "mark"],
  [29, "grid3"],
  [33, "lines"],
  [38, "tree"],
  [43, "stairs"],
  [44, "grid2"],
]);

function pieceStyle([x, y, w, h]: Piece, cell: number) {
  return {
    "--x": x,
    "--y": y,
    "--sx0": SEED / w,
    "--sy0": SEED / h,
    "--dx": DOT / w,
    "--dy": DOT / h,
    width: `calc(${w} * var(--u))`,
    height: `calc(${h} * var(--u))`,
    // Pieces nearer the centre move first, so the shape unfolds outwards;
    // the cell offset keeps neighbouring cells out of step.
    animationDelay: `${Math.hypot(x, y) * 35 - cell * 630}ms`,
  } as CSSProperties;
}

const CELL = "relative grid place-items-center rounded-lg bg-paper";

/** Opaque, so pieces stacked on the centre read as one square. */
const PIECE =
  "absolute top-1/2 left-1/2 rounded-[1px] bg-[color-mix(in_oklab,var(--ink)_11%,var(--paper))] will-change-transform [transform:translate(calc(-50%_+_var(--x)*var(--u)),calc(-50%_+_var(--y)*var(--u)))] motion-safe:animate-morph";

/**
 * A grid of rounded cells. The container's background shows through the gaps
 * and at the rounded corners, which draws the lines and fills in the joints.
 * Sized from `--cell`, set on the hero stage.
 */
export function HeroCells() {
  return (
    <div
      className="absolute top-0 left-1/2 grid h-[calc(var(--cell)*5+1px)] w-[calc(var(--cell)*16+1px)] -translate-x-1/2 auto-rows-[calc(var(--cell)-1px)] grid-cols-16 gap-px bg-hairline [--u:calc(var(--cell)/14)] max-lg:hidden"
      aria-hidden
    >
      <div className={`${CELL} col-[5/13] row-[2/6]`} />
      {Array.from({ length: CELL_COUNT }, (_, index) => index).map((index) => {
        const shape = SHAPE_CELLS.get(index);
        return (
          <div key={index} className={CELL}>
            {shape === "tree" ? (
              <TreeShape cell={index} />
            ) : shape ? (
              SHAPES[shape].map((piece) => (
                <span
                  key={piece.join()}
                  className={PIECE}
                  style={pieceStyle(piece, index)}
                />
              ))
            ) : (
              <span className="size-0.75 rounded-full bg-ink/12" />
            )}
          </div>
        );
      })}
    </div>
  );
}
