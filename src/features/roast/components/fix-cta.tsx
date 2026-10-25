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
        className="relative flex-1 overflow-hidden max-sm:hidden"
      >
        <svg
          viewBox={`0 0 ${COLS} ${ROW_REACH.length}`}
          preserveAspectRatio="xMinYMid meet"
          shapeRendering="crispEdges"
          className="absolute inset-y-0 left-0 h-full text-foreground brand:text-[#ff4d00]"
          style={{ aspectRatio: `${COLS} / ${ROW_REACH.length}` }}
        >
          {CELLS.map(({ col, row }) => (
            <rect
              key={`${col}-${row}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
