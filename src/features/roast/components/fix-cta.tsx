import { Button } from "@/components/ui/button";
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

const DUST = (() => {
  const random = seeded(7);
  return EDGE_COLS.flatMap((col, row) => {
    // Cubes start crumbling at different moments so the edge never moves as
    // one, and cubes further right go before the ones nearer the panel.
    const cubeDelay = (COLS - 1 - col) * 0.35 + random() * 0.8;
    return Array.from({ length: DUST_SPLIT * DUST_SPLIT }, (_, index) => {
      const ix = index % DUST_SPLIT;
      const iy = Math.floor(index / DUST_SPLIT);
      return {
        key: `${row}-${index}`,
        x: col + ix * DUST_SIZE,
        y: row + iy * DUST_SIZE,
        // The right side of a cube goes first, like it is blown off.
        delay: cubeDelay + (DUST_SPLIT - 1 - ix) * 0.18 + random() * 0.5,
        dx: 1.2 + random() * 3.3,
        dy: -1.6 + random() * 2.1,
        rot: Math.round((random() - 0.5) * 180),
      };
    });
  });
})();

/** A solid brand block that asks for the fix after the verdict. */
export function FixCta({
  mailto,
  onFixClick,
  onRoastAnother,
}: {
  mailto: string;
  onFixClick: () => void;
  onRoastAnother: () => void;
}) {
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
            <a href={mailto} onClick={onFixClick}>
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
          {DUST.map(({ key, x, y, delay, dx, dy, rot }) => (
            <rect
              key={key}
              x={x}
              y={y}
              // A hair over size so neighbours overlap and the cube looks
              // solid until it starts to break up.
              width={DUST_SIZE + 0.01}
              height={DUST_SIZE + 0.01}
              fill="currentColor"
              className="animate-snap-dust motion-reduce:animate-none"
              style={
                {
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animationDelay: `${delay.toFixed(2)}s`,
                  "--dx": `${dx.toFixed(2)}px`,
                  "--dy": `${dy.toFixed(2)}px`,
                  "--rot": `${rot}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
