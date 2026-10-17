"use client";

import { toast } from "sonner";
import { getMarkSVG } from "@/components/yt-mark";
import { CopyButton } from "@/components/copy-button";
import { getWordmarkSVG } from "@/components/yt-wordmark";

export function CopyBrandSvgButton({ type }: { type: "mark" | "logotype" }) {
  const getSVG = type === "mark" ? getMarkSVG : getWordmarkSVG;
  const label = type === "mark" ? "Mark" : "Logotype";

  return (
    <CopyButton
      variant="outline"
      size="sm"
      text={getSVG}
      aria-label={`Copy ${label} as SVG`}
      trackAs={type === "mark" ? "brand_mark_svg" : "brand_logotype_svg"}
      onCopySuccess={() => toast.success(`${label} as SVG copied`)}
      className="px-2"
    />
  );
}
