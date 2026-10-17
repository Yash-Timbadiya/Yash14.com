"use client";

import type { VolumeIconHandle } from "@/components/animated-icons/volume-icon";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";
import { trackEvent } from "@/lib/analytics";
import { useHotkeys } from "react-hotkeys-hook";
import { VolumeIcon } from "@/components/animated-icons/volume-icon";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function PronounceMyName({
  className,
  namePronunciationUrl,
}: {
  className?: string;
  namePronunciationUrl: string;
}) {
  const [play] = useSound(namePronunciationUrl);

  const volumeIconRef = useRef<VolumeIconHandle>(null);

  const handlePlay = (method: "click" | "keyboard") => {
    trackEvent(ANALYTICS_EVENTS.NAME_PRONUNCIATION_PLAYED, {
      method,
      section: ANALYTICS_SECTIONS.PROFILE_HEADER,
    });
    volumeIconRef.current?.startAnimation();
    play();
  };

  useHotkeys("p", () => handlePlay("keyboard"));

  return (
    <button
      type="button"
      className={cn(
        "relative flex touch-manipulation items-center justify-center text-muted-foreground transition-[color,scale] will-change-[scale] select-none hover:text-foreground active:scale-[0.9]",
        className,
      )}
      onClick={() => handlePlay("click")}
      aria-label="Pronounce my name"
    >
      <span className="absolute size-12 pointer-fine:hidden" aria-hidden />
      <VolumeIcon ref={volumeIconRef} className="size-4.5" aria-hidden />
    </button>
  );
}
