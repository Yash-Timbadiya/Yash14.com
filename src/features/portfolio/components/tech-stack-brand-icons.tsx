import type { TechStackBrandIcon } from "../types/tech-stack";

import { cn } from "@/lib/utils";

const IMG_CLASS =
  "pointer-events-none hidden size-3.5 shrink-0 object-contain select-none";

/** Renders both icon sets; visibility follows the `brand:` / `mono:` variants. */
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
      <span className="hidden mono:contents">{icon}</span>
      <img
        className={cn(
          IMG_CLASS,
          brandIcon.dark ? "brand:not-dark:block" : "brand:block",
        )}
        src={brandIcon.light}
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden
      />
      {brandIcon.dark && (
        <img
          className={cn(IMG_CLASS, "brand:dark:block")}
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
