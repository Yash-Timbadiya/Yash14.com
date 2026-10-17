"use client";

import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { getMarkSVG } from "@/components/yt-mark";
import { CopyButton } from "@/components/copy-button";
import { getWordmarkSVG } from "@/components/yt-wordmark";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

export function CopyBrandSvgButton({ type }: { type: "mark" | "logotype" }) {
  const getSVG = type === "mark" ? getMarkSVG : getWordmarkSVG;
  const label = type === "mark" ? "Mark" : "Logotype";

  return (
    <CopyButton
      variant="outline"
      size="sm"
      text={getSVG}
      onCopySuccess={() => {
        trackEvent(
          type === "mark"
            ? ANALYTICS_EVENTS.COPY_MARK_SVG
            : ANALYTICS_EVENTS.COPY_LOGOTYPE_SVG,
          {
            section: ANALYTICS_SECTIONS.BRAND_GUIDELINES,
            source: ANALYTICS_SOURCES.ASSET_BUTTONS,
          },
        );
        toast.success(`${label} as SVG copied`);
      }}
      className="px-2"
    />
  );
}
