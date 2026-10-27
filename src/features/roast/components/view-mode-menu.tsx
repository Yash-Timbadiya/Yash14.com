"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutPanelLeftIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type RoastView = "roast" | "split" | "editorial";

const BLOCK = "block rounded-[1px] bg-muted-foreground/25";
const ACCENT_BLOCK =
  "block rounded-[1px] bg-foreground/60 brand:bg-[#ff4d00]/80";
const INK_BLOCK = "block rounded-[1px] bg-foreground/70";
const LINE = "border-muted-foreground/25";
const ACCENT_BORDER = "border-foreground/60 brand:border-[#ff4d00]/80";
// The top half of a ring, the shape of every half gauge.
const HALF_DIAL = "relative block aspect-[2/1] rounded-t-full border-b-0";
// A ring open at the bottom, like the 280-degree dials.
const OPEN_RING = "block rounded-full border-b-transparent";
const DIVIDER = "stripe-divider block h-1 w-full shrink-0 opacity-60";

/** A needle from the bottom centre of a half dial, turned to `angle` degrees. */
function Needle({ angle }: { angle: number }) {
  return (
    <span
      className="absolute bottom-0 left-1/2 block h-px w-[44%] origin-left bg-foreground/80"
      style={{ transform: `rotate(${angle}deg)` }}
    />
  );
}

/** A half gauge: an accent arc and, optionally, a needle. */
function HalfGauge({
  width = 3,
  needle,
  className,
}: {
  width?: number;
  needle?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(HALF_DIAL, ACCENT_BORDER, className)}
      style={{ borderWidth: width, borderBottomWidth: 0 }}
    >
      {needle !== undefined && <Needle angle={needle} />}
    </span>
  );
}

const LINE_KEYS = ["first", "second", "third"];

/** A category row: label, text lines, and the score on the right. */
function Row({ lines = 1, score }: { lines?: number; score: "bar" | "faded" }) {
  return (
    <span className="relative flex items-center gap-1.5">
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cn("h-0.5 w-1/4", INK_BLOCK)} />
        {LINE_KEYS.slice(0, lines).map((key, line) => (
          <span
            key={key}
            className={cn(
              "h-0.5",
              line === lines - 1 ? "w-2/3" : "w-full",
              BLOCK,
            )}
          />
        ))}
      </span>
      {score === "bar" ? (
        <span className="flex items-center gap-0.5">
          <span className="flex h-0.5 w-4 rounded-full bg-muted-foreground/25">
            <span className={cn("h-full w-2/3", ACCENT_BLOCK)} />
          </span>
          <span className={cn("h-1 w-1.5", ACCENT_BLOCK)} />
        </span>
      ) : (
        // The big faded score in the row's top-right corner.
        <span className="absolute -top-0.5 right-0 font-sans text-[9px] leading-none font-bold text-foreground/25 brand:text-[#ff4d00]/35">
          45
        </span>
      )}
    </span>
  );
}

/** Skeleton sketches of each layout, drawn small inside the menu. */
const THUMBNAILS: Record<RoastView, () => React.ReactNode> = {
  // A boxed dial beside the grade and four half gauges, a divider, then
  // full-width rows with a score bar.
  roast: () => (
    <span className="flex h-full flex-col gap-1">
      <span className={cn("flex items-center border-b pb-1", LINE)}>
        <span
          className={cn(
            "flex w-[34%] items-center justify-center border-r pr-1",
            LINE,
          )}
        >
          <span
            className={cn(
              OPEN_RING,
              ACCENT_BORDER,
              "flex size-8 items-center justify-center border-[3px] brand:border-b-transparent",
            )}
          >
            <span className={cn("h-1.5 w-2.5", ACCENT_BLOCK)} />
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-0.5 pl-1.5">
          <span className={cn("h-1 w-3/5", INK_BLOCK)} />
          <span className={cn("h-0.5 w-4/5", BLOCK)} />
          <span className="mt-1 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((gauge) => (
              <HalfGauge key={gauge} width={2} />
            ))}
          </span>
        </span>
      </span>
      <span className={DIVIDER} />
      <span className="flex flex-1 flex-col justify-between">
        <Row score="bar" lines={2} />
        <Row score="bar" lines={2} />
        <Row score="bar" lines={2} />
      </span>
    </span>
  ),
  // A score column (speedometer with a needle, grade, 2 by 2 needle gauges)
  // beside rows that carry their score faded in the corner.
  split: () => (
    <span className="flex h-full gap-1.5">
      <span
        className={cn("flex w-[36%] flex-col gap-0.5 border-r pr-1.5", LINE)}
      >
        <HalfGauge width={3} needle={-20} className="mx-auto w-4/5" />
        <span className={cn("mx-auto h-1 w-1/3", INK_BLOCK)} />
        <span className={cn("mt-0.5 h-1 w-3/4", INK_BLOCK)} />
        <span className={cn("h-0.5 w-full", BLOCK)} />
        <span className={cn("mt-auto grid grid-cols-2 border", LINE)}>
          {[-90, -25, -20, -22].map((angle, cell) => (
            <span
              key={angle}
              className={cn(
                "p-0.5",
                LINE,
                cell % 2 === 0 && "border-r",
                cell < 2 && "border-b",
              )}
            >
              <HalfGauge width={2} needle={angle} />
            </span>
          ))}
        </span>
      </span>
      <span className="flex flex-1 flex-col justify-between">
        <Row score="faded" lines={3} />
        <Row score="faded" lines={3} />
        <Row score="faded" lines={3} />
      </span>
    </span>
  ),
  // The grade as a serif headline beside a segmented thermostat dial, a row
  // of volume knobs, a divider, then numbered sections.
  editorial: () => (
    <span className="flex h-full flex-col gap-1">
      <span className={cn("flex items-center gap-1.5 border-b pb-1", LINE)}>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className={cn("h-1.5 w-4/5", INK_BLOCK)} />
          <span className={cn("h-0.5 w-3/5", BLOCK)} />
        </span>
        <span
          className={cn(
            OPEN_RING,
            ACCENT_BORDER,
            "flex size-9 shrink-0 flex-col items-center justify-center gap-0.5 border-[3px] border-dashed brand:border-b-transparent",
          )}
        >
          <span className={cn("h-0.5 w-2.5", BLOCK)} />
          <span className={cn("h-1.5 w-3", INK_BLOCK)} />
        </span>
      </span>
      <span className="grid grid-cols-4">
        {[0, 1, 2, 3].map((knob) => (
          <span
            key={knob}
            className={cn("flex justify-center", LINE, knob < 3 && "border-r")}
          >
            <span
              className={cn(
                OPEN_RING,
                ACCENT_BORDER,
                "block size-3.5 border-[1.5px] bg-muted-foreground/20 brand:border-b-transparent",
              )}
            />
          </span>
        ))}
      </span>
      <span className={DIVIDER} />
      <span className="flex flex-1 flex-col justify-between">
        {[0, 1].map((section) => (
          <span key={section} className="flex gap-1.5">
            <span className="flex w-1/5 flex-col gap-0.5">
              <span className={cn("h-0.5 w-1.5", BLOCK)} />
              <span className={cn("h-0.5 w-full", INK_BLOCK)} />
              <span className={cn("h-1.5 w-2.5", ACCENT_BLOCK)} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className={cn("h-1 w-full", BLOCK)} />
              <span className={cn("h-1 w-full", BLOCK)} />
              <span className={cn("h-1 w-2/3", BLOCK)} />
            </span>
          </span>
        ))}
      </span>
    </span>
  ),
};

const VIEWS: { value: RoastView; label: string }[] = [
  { value: "roast", label: "Classic" },
  { value: "split", label: "Split" },
  { value: "editorial", label: "Editorial" },
];

/**
 * Icon button that opens a small menu of the other report layouts, each shown
 * as a skeleton sketch. The current layout is left out of the menu.
 */
export function ViewModeMenu({
  view,
  onChange,
}: {
  view: RoastView;
  onChange: (view: RoastView) => void;
}) {
  const [open, setOpen] = useState(false);
  const others = VIEWS.filter((option) => option.value !== view);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Change report view"
        >
          <LayoutPanelLeftIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-3">
        <p className="px-0.5 text-sm font-medium">Report layout</p>
        <div className="grid grid-cols-2 gap-2.5">
          {others.map((option) => {
            const Thumbnail = THUMBNAILS[option.value];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                title={option.label}
                className="group flex flex-col rounded-xl text-left focus-visible:outline-none"
              >
                <span className="block h-28 overflow-hidden rounded-lg bg-muted p-2 ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-ring brand:group-hover:ring-[#ff4d00]/60">
                  <span className="block h-full">
                    <Thumbnail />
                  </span>
                </span>
                {/* Hidden from sight; the sketch says it, the name is for screen readers. */}
                <span className="sr-only">{option.label} layout</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
