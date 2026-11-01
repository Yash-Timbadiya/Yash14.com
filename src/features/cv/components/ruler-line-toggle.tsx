"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RulerDimensionLineIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";

const STORAGE_KEY = "cv-ruler-line";

/**
 * Shows or hides the ruler's orange reading line and its "Get in touch"
 * badge. The choice is kept in localStorage and applied as an attribute on
 * <html>, so cv.css can hide the line without the ruler re-rendering.
 */
export function RulerLineToggle() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === "hidden");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.dataset.rulerLine = "hidden";
    } else {
      delete root.dataset.rulerLine;
    }
  }, [hidden]);

  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    if (next) {
      localStorage.setItem(STORAGE_KEY, "hidden");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const label = hidden ? "Show reading line" : "Hide reading line";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="ruler-line-toggle relative touch-manipulation border-none"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={!hidden}
            data-off={hidden}
            onClick={toggle}
          >
            <RulerDimensionLineIcon aria-hidden />
          </Button>
        }
      />
      <TooltipContent className="px-3">{label}</TooltipContent>
    </Tooltip>
  );
}
