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
const LINE = "border-muted-foreground/25";
// A half dial, drawn as the top of a ring.
const HALF_DIAL = "block aspect-[2/1] rounded-t-full border-[3px] border-b-0";
const DIVIDER = "stripe-divider block h-1 w-full shrink-0 opacity-60";

/** A text line: the label above, the roast line below. */
function Row({ score = "bar" }: { score?: "bar" | "faded" | "none" }) {
  return (
    <span className="flex items-center gap-1">
      <span className="flex flex-1 flex-col gap-0.5">
        <span className={cn("h-0.5 w-1/3", BLOCK)} />
        <span className={cn("h-1 w-full", BLOCK)} />
      </span>
      {score === "bar" && <span className={cn("h-0.5 w-3", ACCENT_BLOCK)} />}
      {score === "faded" && (
        <span className="self-start font-sans text-[7px] leading-none font-bold text-foreground/30 brand:text-[#ff4d00]/40">
          47
        </span>
      )}
    </span>
  );
}

/** Skeleton sketches of each layout, drawn small inside the menu. */
const THUMBNAILS: Record<RoastView, () => React.ReactNode> = {
  // Full dial beside the grade and four half gauges, then full-width rows
  // with bars, then the verdict.
  roast: () => (
    <span className="flex h-full flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "block size-7 shrink-0 rounded-full border-[3px] border-b-transparent border-foreground/60 brand:border-[#ff4d00]/80 brand:border-b-transparent",
          )}
        />
        <span className="flex flex-1 flex-col gap-1">
          <span className={cn("h-1 w-1/2", BLOCK)} />
          <span className={cn("h-0.5 w-2/3", BLOCK)} />
          <span className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((gauge) => (
              <span key={gauge} className={cn(HALF_DIAL, LINE)} />
            ))}
          </span>
        </span>
      </span>
      <span className={DIVIDER} />
      <span className="flex flex-1 flex-col justify-between">
        <Row />
        <Row />
        <Row />
      </span>
      <span className={cn("h-1 w-3/4", BLOCK)} />
    </span>
  ),
  // A score column (speedometer, grade, 2 by 2 gauges) beside rows that
  // carry their score faded in the corner; the verdict below.
  split: () => (
    <span className="flex h-full flex-col gap-1">
      <span className="flex flex-1 gap-1.5">
        <span
          className={cn("flex w-[38%] flex-col gap-1 border-r pr-1.5", LINE)}
        >
          <span
            className={cn(
              HALF_DIAL,
              "mx-auto w-4/5 border-foreground/60 brand:border-[#ff4d00]/80",
            )}
          />
          <span className={cn("h-1 w-2/3", BLOCK)} />
          <span className={cn("mt-auto grid grid-cols-2 border", LINE)}>
            {[0, 1, 2, 3].map((gauge) => (
              <span
                key={gauge}
                className={cn(
                  "p-0.5",
                  LINE,
                  gauge % 2 === 0 && "border-r",
                  gauge < 2 && "border-b",
                )}
              >
                <span className={cn(HALF_DIAL, "border-2", LINE)} />
              </span>
            ))}
          </span>
        </span>
        <span className="flex flex-1 flex-col justify-between">
          <Row score="faded" />
          <Row score="faded" />
          <Row score="faded" />
          <Row score="faded" />
        </span>
      </span>
      <span className={DIVIDER} />
      <span className={cn("h-1 w-3/4", BLOCK)} />
    </span>
  ),
  // The grade as a headline beside a thermostat dial, a row of knobs, then
  // numbered sections and the verdict.
  editorial: () => (
    <span className="flex h-full flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <span className="flex flex-1 flex-col gap-1">
          <span className={cn("h-1.5 w-4/5", BLOCK)} />
          <span className={cn("h-0.5 w-1/2", BLOCK)} />
        </span>
        <span className="block size-7 shrink-0 rounded-full border-[3px] border-dotted border-foreground/60 border-b-transparent brand:border-[#ff4d00]/80 brand:border-b-transparent" />
      </span>
      <span className="flex justify-between px-1">
        {[0, 1, 2, 3].map((knob) => (
          <span
            key={knob}
            className={cn("block size-2.5 rounded-full border-2", LINE)}
          />
        ))}
      </span>
      <span className={DIVIDER} />
      <span className="flex flex-1 flex-col justify-between">
        {[0, 1, 2].map((section) => (
          <span key={section} className="flex items-center gap-1">
            <span className="flex w-4 flex-col gap-0.5">
              <span className={cn("h-0.5 w-2", BLOCK)} />
              <span className={cn("h-1.5 w-3", ACCENT_BLOCK)} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className={cn("h-1 w-full", BLOCK)} />
              <span className={cn("h-1 w-3/4", BLOCK)} />
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
                <span className="block aspect-4/3 rounded-lg bg-muted p-2 ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-foreground/30 group-focus-visible:ring-2 group-focus-visible:ring-ring brand:group-hover:ring-[#ff4d00]/60">
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
