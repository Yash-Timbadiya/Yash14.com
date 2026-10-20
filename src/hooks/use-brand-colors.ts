"use client";

import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Shared by every section that can show original brand colours; on by default.
const brandColorsAtom = atomWithStorage("brand-colors", true);

export function useBrandColors() {
  return useAtom(brandColorsAtom);
}
