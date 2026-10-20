"use client";

import { useBrandColors } from "@/hooks/use-brand-colors";

/**
 * Exposes the brand-colors setting as `data-brand-colors` on a `group/brand`
 * wrapper, so server-rendered children can react to it with CSS alone
 * (`group-data-[brand-colors=true]/brand:*`).
 */
export function BrandColorsScope({ children }: React.PropsWithChildren) {
  const [enabled] = useBrandColors();

  return (
    <div data-brand-colors={enabled} className="group/brand contents">
      {children}
    </div>
  );
}
