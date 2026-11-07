import type { CSSProperties } from "react";

const COLUMNS = 16;
const ROWS = 5;
/** Sixteen wide, minus the eight by four clear space behind the copy. */
const CELL_COUNT = COLUMNS * ROWS - 8 * 4;

/** Cell indexes that show flickering pixels instead of a dot. */
const PIXEL_CELLS = new Set([11, 13, 22, 36, 41]);

/**
 * A grid of rounded cells. The container's background shows through the gaps
 * and at the rounded corners, which draws the lines and fills in the joints.
 */
export function HeroCells() {
  return (
    <div className="home-cells" aria-hidden>
      <div className="home-cell home-cell-clear" />
      {Array.from({ length: CELL_COUNT }, (_, index) => index).map((index) => (
        <div key={index} className="home-cell">
          {PIXEL_CELLS.has(index) ? (
            <div className="home-pixels">
              {Array.from({ length: 9 }, (_, pixel) => pixel).map((pixel) => (
                <span
                  key={pixel}
                  style={{ "--i": (pixel * 5 + index) % 7 } as CSSProperties}
                />
              ))}
            </div>
          ) : (
            <span className="home-cell-dot" />
          )}
        </div>
      ))}
    </div>
  );
}
