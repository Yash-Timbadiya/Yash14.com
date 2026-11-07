import type { CSSProperties } from "react";

const COLUMNS = 16;
const ROWS = 5;
/** Sixteen wide, minus the eight by four clear space behind the copy. */
const CELL_COUNT = COLUMNS * ROWS - 8 * 4;

/** Cell indexes that show flickering pixels instead of a dot. */
const PIXEL_CELLS = new Set([11, 13, 22, 36, 41]);

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
      {Array.from({ length: CELL_COUNT }, (_, index) => index).map((index) => (
        <div key={index} className={CELL}>
          {PIXEL_CELLS.has(index) ? (
            <div className="grid grid-cols-[repeat(3,0.5625rem)] gap-1">
              {Array.from({ length: 9 }, (_, pixel) => pixel).map((pixel) => (
                <span
                  key={pixel}
                  className="aspect-square animate-pixel bg-ink/12 [animation-delay:calc(var(--i)*-0.7s)] motion-reduce:animate-none"
                  style={{ "--i": (pixel * 5 + index) % 7 } as CSSProperties}
                />
              ))}
            </div>
          ) : (
            <span className="size-[3px] rounded-full bg-ink/12" />
          )}
        </div>
      ))}
    </div>
  );
}
