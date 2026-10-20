"use client";

import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { PaletteIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import { useBrandColors } from "@/hooks/use-brand-colors";
import { useClickSound } from "@/hooks/soundcn/use-click-sound";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";

/** Toggles brand colors site-wide; render it once, since it also binds the `T` shortcut. */
export function BrandColorsToggle({
  section,
  className,
}: {
  section: AnalyticsSection;
  className?: string;
}) {
  const [enabled, setEnabled] = useBrandColors();
  const [click] = useClickSound();
  const label = enabled ? "Show monochrome colors" : "Show brand colors";

  const toggle = (method: "click" | "keyboard") => {
    click();
    trackEvent(ANALYTICS_EVENTS.BRAND_COLORS_TOGGLED, {
      section,
      enabled: !enabled,
      method,
    });
    setEnabled(!enabled);
  };

  useHotkeys("t", () => {
    trackEvent(ANALYTICS_EVENTS.SHORTCUT_USED, {
      section: ANALYTICS_SECTIONS.KEYBOARD,
      shortcut: "t",
      action: "toggle_brand_colors",
    });
    toggle("keyboard");
  });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className={cn(
              "relative touch-manipulation border-none text-muted-foreground data-[state=on]:text-foreground",
              className,
            )}
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={enabled}
            aria-keyshortcuts="T"
            data-state={enabled ? "on" : "off"}
            onClick={() => toggle("click")}
          >
            <span
              className="absolute size-12 pointer-fine:hidden"
              aria-hidden
            />
            <PaletteIcon aria-hidden />
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          {label}
          <Kbd>T</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
