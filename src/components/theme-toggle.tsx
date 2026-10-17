"use client";

import { Kbd } from "./ui/kbd";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { trackEvent } from "@/lib/analytics";
import { useHotkeys } from "react-hotkeys-hook";
import { META_THEME_COLORS } from "@/config/site";
import { MoonIcon } from "./animated-icons/moon-icon";
import { useMetaColor } from "@/hooks/use-meta-color";
import { useClickSound } from "@/hooks/soundcn/use-click-sound";
import { SunMediumIcon } from "./animated-icons/sun-medium-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const { setMetaColor } = useMetaColor();

  const [click] = useClickSound();

  const applyTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setMetaColor(
      resolvedTheme === "dark"
        ? META_THEME_COLORS.light
        : META_THEME_COLORS.dark,
    );
  };

  const switchTheme = (method: "click" | "keyboard") => {
    click();

    trackEvent(ANALYTICS_EVENTS.THEME_CHANGED, {
      from: resolvedTheme ?? null,
      to: resolvedTheme === "dark" ? "light" : "dark",
      method,
      section: ANALYTICS_SECTIONS.HEADER,
    });

    if (
      typeof document === "undefined" ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme();
      return;
    }

    document.startViewTransition(() => {
      applyTheme();
    });
  };

  useHotkeys("d", () => {
    trackEvent(ANALYTICS_EVENTS.SHORTCUT_USED, {
      section: ANALYTICS_SECTIONS.KEYBOARD,
      shortcut: "d",
      action: "toggle_theme",
    });
    switchTheme("keyboard");
  });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="relative touch-manipulation border-none"
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle Mode"
            onClick={() => switchTheme("click")}
          >
            <span
              className="absolute size-12 pointer-fine:hidden"
              aria-hidden
            />
            <MoonIcon className="hidden [html.dark_&]:block" aria-hidden />
            <SunMediumIcon
              className="hidden [html.light_&]:block"
              aria-hidden
            />
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          Toggle Mode
          <Kbd>D</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
