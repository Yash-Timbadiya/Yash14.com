import type { TechStackBrandIcon } from "../types/tech-stack";

import { cn } from "@/lib/utils";

const IMG_CLASS =
  "pointer-events-none hidden size-3.5 shrink-0 object-contain select-none";

/** Renders both icon sets; visibility is driven by the nearest `BrandColorsScope`. */
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
      <span className="contents group-data-[brand-colors=true]/brand:hidden">
        {icon}
      </span>
      <img
        className={cn(
          IMG_CLASS,
          brandIcon.dark
            ? "group-data-[brand-colors=true]/brand:not-dark:block"
            : "group-data-[brand-colors=true]/brand:block",
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
            "group-data-[brand-colors=true]/brand:dark:block",
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
