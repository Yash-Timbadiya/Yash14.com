"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Brand colors are on by default. When off, `<html data-brand-colors="false">`
 * is set (before paint by the inline script in the root layout), and sections
 * restyle with the `mono:` / `brand:` CSS variants, so server and client
 * markup always match.
 */
export const BRAND_COLORS_STORAGE_KEY = "brand-colors";

const CHANGE_EVENT = "brand-colors-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  return document.documentElement.dataset.brandColors !== "false";
}

function getServerSnapshot() {
  return true;
}

export function useBrandColors() {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setEnabled = useCallback((value: boolean) => {
    if (value) {
      delete document.documentElement.dataset.brandColors;
    } else {
      document.documentElement.dataset.brandColors = "false";
    }
    try {
      localStorage.setItem(BRAND_COLORS_STORAGE_KEY, String(value));
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [enabled, setEnabled] as const;
}
