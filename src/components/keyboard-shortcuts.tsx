"use client";

import { trackEvent } from "@/lib/analytics";
import { useRouter } from "@bprogress/next/app";
import { useHotkeys } from "react-hotkeys-hook";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function KeyboardShortcuts() {
  const router = useRouter();

  const navigate = (path: string, keys: string) => {
    trackEvent(ANALYTICS_EVENTS.SHORTCUT_USED, {
      section: ANALYTICS_SECTIONS.KEYBOARD,
      shortcut: keys,
      action: "navigate",
      destination: path,
    });
    trackEvent(
      path === "/"
        ? ANALYTICS_EVENTS.VIEW_HOME
        : ANALYTICS_EVENTS.VIEW_BRAND_GUIDELINES,
      { section: ANALYTICS_SECTIONS.KEYBOARD },
    );
    router.push(path);
  };

  useHotkeys("g>h", () => navigate("/", "g>h"));
  useHotkeys("g>y", () => navigate("/brand-guidelines", "g>y"));

  return null;
}
