"use client";

import type { TechStackBrandIcon } from "../types/tech-stack";

import { cn } from "@/lib/utils";
import { PaletteIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useBrandColors } from "@/hooks/use-brand-colors";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";

/**
 * Exposes the brand-colors setting as `data-brand-icons` on a `group/stack`
 * wrapper so badges can swap icons with CSS alone and stay server-rendered.
 */
export function TechStackBrandIconsScope({
  children,
}: React.PropsWithChildren) {
  const [enabled] = useBrandColors();

  return (
    <div data-brand-icons={enabled} className="group/stack">
      {children}
    </div>
  );
}

/** Toggles brand colors site-wide: stack logos, social links and the contribution graph. */
export function TechStackBrandIconsToggle() {
  const [enabled, setEnabled] = useBrandColors();
  const label = enabled ? "Show monochrome icons" : "Show brand colors";

  const toggle = () => {
    trackEvent(ANALYTICS_EVENTS.BRAND_COLORS_TOGGLED, {
      section: ANALYTICS_SECTIONS.TECH_STACK,
      enabled: !enabled,
    });
    setEnabled(!enabled);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="relative touch-manipulation border-none text-muted-foreground data-[state=on]:text-foreground"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={enabled}
            data-state={enabled ? "on" : "off"}
            onClick={toggle}
          >
            <span
              className="absolute size-12 pointer-fine:hidden"
              aria-hidden
            />
            <PaletteIcon aria-hidden />
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const IMG_CLASS =
  "pointer-events-none hidden size-3.5 shrink-0 object-contain select-none";

/** Renders both icon sets; visibility is driven by the nearest `group/stack`. */
export function TechStackItemIcon({
  icon,
  brandIcon,
}: {
  icon: React.ReactElement;
  brandIcon?: TechStackBrandIcon;
}) {
  if (!brandIcon) return icon;

  return (
    <>
      <span className="contents group-data-[brand-icons=true]/stack:hidden">
        {icon}
      </span>
      <img
        className={cn(
          IMG_CLASS,
          brandIcon.dark
            ? "group-data-[brand-icons=true]/stack:not-dark:block"
            : "group-data-[brand-icons=true]/stack:block",
        )}
        src={brandIcon.light}
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden
      />
      {brandIcon.dark && (
        <img
          className={cn(
            IMG_CLASS,
            "group-data-[brand-icons=true]/stack:dark:block",
          )}
          src={brandIcon.dark}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden
        />
      )}
    </>
  );
}
