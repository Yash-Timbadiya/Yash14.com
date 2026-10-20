"use client";

import type { TechStackBrandIcon } from "../types/tech-stack";

import { cn } from "@/lib/utils";
import { useBrandColors } from "@/hooks/use-brand-colors";

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
