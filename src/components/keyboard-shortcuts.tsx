"use client";

import { trackEvent } from "@/lib/analytics";
import { useRouter } from "@bprogress/next/app";
import { useHotkeys } from "react-hotkeys-hook";

export function KeyboardShortcuts() {
  const router = useRouter();

  const navigate = (path: string, keys: string) => {
    trackEvent("keyboard_shortcut_used", {
      shortcut: keys,
      action: "navigate",
      destination: path,
    });
    router.push(path);
  };

  useHotkeys("g>h", () => navigate("/", "g>h"));
  useHotkeys("g>y", () => navigate("/brand-guidelines", "g>y"));

  return null;
}
