"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getMarkSVG } from "@/components/yt-mark";
import { CopyStateIcon } from "@/components/copy-button";
import { getWordmarkSVG } from "@/components/yt-wordmark";
import { BTN, BTN_SOFT } from "@/features/home/lib/styles";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

export function CopyBrandSvgButton({ type }: { type: "mark" | "logotype" }) {
  const label = type === "mark" ? "Mark" : "Logotype";
  const { state, copy } = useCopyToClipboard({
    onCopySuccess: () => {
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
    },
  });

  return (
    <button
      type="button"
      className={cn(BTN, BTN_SOFT, "h-9 px-3")}
      onClick={() => copy(type === "mark" ? getMarkSVG : getWordmarkSVG)}
    >
      <CopyStateIcon state={state} />
      Copy SVG
    </button>
  );
}
