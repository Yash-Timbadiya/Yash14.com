"use client";

import { useRouter } from "@bprogress/next/app";
import { useHotkeys } from "react-hotkeys-hook";

export function KeyboardShortcuts() {
  const router = useRouter();

  const navigate = (path: string, _keys: string) => {
    router.push(path);
  };

  useHotkeys("g>h", () => navigate("/", "g>h"));
  useHotkeys("g>y", () => navigate("/brand-guidelines", "g>y"));

  return null;
}
