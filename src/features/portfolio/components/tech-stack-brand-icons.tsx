"use client";

import type { TechStackBrandIcon } from "../types/tech-stack";

import { cn } from "@/lib/utils";
import { PaletteIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { createContext, use, useState } from "react";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip";

type BrandIconsContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const BrandIconsContext = createContext<BrandIconsContextValue | null>(null);

/**
 * Exposes the brand-icons state as `data-brand-icons` on a `group/stack`
 * wrapper so badges can swap icons with CSS alone and stay server-rendered.
 */
export function TechStackBrandIconsScope({
  children,
}: React.PropsWithChildren) {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {
    trackEvent(ANALYTICS_EVENTS.TECH_STACK_BRAND_ICONS_TOGGLED, {
      section: ANALYTICS_SECTIONS.TECH_STACK,
      enabled: !enabled,
    });
    setEnabled(!enabled);
  };

  return (
    <BrandIconsContext value={{ enabled, toggle }}>
      <div data-brand-icons={enabled} className="group/stack">
        {children}
      </div>
    </BrandIconsContext>
  );
}

export function TechStackBrandIconsToggle() {
  const context = use(BrandIconsContext);
  if (!context) {
    throw new Error(
      "TechStackBrandIconsToggle must be used within TechStackBrandIconsScope",
    );
  }

  const { enabled, toggle } = context;
  const label = enabled ? "Show monochrome icons" : "Show brand colors";

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
