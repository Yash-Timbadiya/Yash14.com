import type { CSSProperties } from "react";

const COLUMNS = 16;
const ROWS = 5;
/** Sixteen wide, minus the eight by four clear space behind the copy. */
const CELL_COUNT = COLUMNS * ROWS - 8 * 4;

type Pattern = "wave" | "ring" | "scatter";

/**
 * Cell indexes that show animated pixels instead of a dot, and how their
 * pixels light up. Kept off the cells under the corner tags (2, 13, 42 and
 * 45), so the labels stay readable.
 */
const PIXEL_CELLS = new Map<number, Pattern>([
  [3, "ring"],
  [6, "wave"],
  [9, "scatter"],
  [12, "ring"],
  [17, "wave"],
  [22, "scatter"],
  [26, "scatter"],
  [29, "wave"],
  [33, "ring"],
  [38, "ring"],
  [43, "wave"],
  [44, "scatter"],
]);

/** The step each pixel of the 3 x 3 grid lights up on, for each pattern. */
function pixelStep(pattern: Pattern, pixel: number, cell: number) {
  const row = Math.floor(pixel / 3);
  const col = pixel % 3;
  if (pattern === "wave") return row + col;
  if (pattern === "ring") return Math.abs(row - 1) + Math.abs(col - 1);
  return (pixel * 5 + cell) % 7;
}

const CELL = "grid place-items-center rounded-lg bg-paper";

/**
 * A grid of rounded cells. The container's background shows through the gaps
 * and at the rounded corners, which draws the lines and fills in the joints.
 * Sized from `--cell`, set on the hero stage.
 */
export function HeroCells() {
  return (
    <div
      className="absolute top-0 left-1/2 grid h-[calc(var(--cell)*5+1px)] w-[calc(var(--cell)*16+1px)] -translate-x-1/2 auto-rows-[calc(var(--cell)-1px)] grid-cols-16 gap-px bg-hairline max-lg:hidden"
      aria-hidden
    >
      <div className={`${CELL} col-[5/13] row-[2/6]`} />
      {Array.from({ length: CELL_COUNT }, (_, index) => index).map((index) => {
        const pattern = PIXEL_CELLS.get(index);
        return (
          <div key={index} className={CELL}>
            {pattern ? (
              <div className="grid grid-cols-[repeat(3,0.5625rem)] gap-1">
                {Array.from({ length: 9 }, (_, pixel) => pixel).map((pixel) => (
                  <span
                    key={pixel}
                    // Each cell starts at its own point in the loop, so they
                    // never flash together.
                    className="aspect-square animate-pixel bg-ink/12 [animation-delay:calc(var(--step)*0.18s_-_var(--offset)*0.53s)] motion-reduce:animate-none"
                    style={
                      {
                        "--step": pixelStep(pattern, pixel, index),
                        "--offset": index,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            ) : (
              <span className="size-[3px] rounded-full bg-ink/12" />
            )}
          </div>
        );
      })}
    </div>
  );
}
