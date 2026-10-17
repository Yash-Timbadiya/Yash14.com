"use client";

import type { AnalyticsProperties } from "@/lib/analytics";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// cmdk options (role="option") are left out: the command menu tracks its own
// actions, including ones triggered from the keyboard.
const TRACKABLE_SELECTOR = [
  "a[href]",
  "button",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemradio"]',
  '[role="menuitemcheckbox"]',
  '[role="tab"]',
  "[data-track]",
].join(",");

const MAX_LABEL_LENGTH = 80;

/**
 * Records every click on a link, button or menu item with one delegated
 * listener, so new interactive elements are tracked without extra code.
 * Elements can refine what is sent with `data-track-label`, or opt out with
 * `data-track-ignore` on themselves or an ancestor.
 */
export function ClickTracker() {
  useEffect(() => {
    // Capture phase: read `aria-expanded` before the click toggles it.
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const element = event.target.closest<HTMLElement>(TRACKABLE_SELECTOR);
      if (!element || element.closest("[data-track-ignore]")) return;

      const properties: AnalyticsProperties = {
        label: getLabel(element),
        section: getSection(element),
        area: getArea(element),
      };

      const toggleAction = getToggleAction(element);
      if (toggleAction) {
        properties.toggle = toggleAction;
      }

      if (element instanceof HTMLAnchorElement) {
        trackEvent("link_clicked", {
          ...properties,
          href: element.href,
          link_type: getLinkType(element),
          new_tab: element.target === "_blank",
        });
        return;
      }

      trackEvent("button_clicked", {
        ...properties,
        element: element.getAttribute("role") ?? element.tagName.toLowerCase(),
      });
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}

function getLabel(element: HTMLElement) {
  const label =
    element.dataset.trackLabel ||
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.textContent?.replace(/\s+/g, " ").trim() ||
    element.querySelector("img")?.getAttribute("alt") ||
    "unlabeled";

  return label.slice(0, MAX_LABEL_LENGTH);
}

function getSection(element: HTMLElement) {
  return element.closest("section[id]")?.id ?? null;
}

function getArea(element: HTMLElement) {
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  if (element.closest('[role="dialog"], [role="menu"]')) return "overlay";
  if (element.closest("nav")) return "nav";
  return "main";
}

function getToggleAction(element: HTMLElement) {
  const expanded = element.getAttribute("aria-expanded");
  if (expanded === "true") return "close";
  if (expanded === "false") return "open";
  return null;
}

function getLinkType(anchor: HTMLAnchorElement) {
  if (anchor.protocol === "mailto:") return "email";
  if (anchor.protocol === "tel:") return "phone";
  if (anchor.hasAttribute("download")) return "download";
  if (anchor.origin !== window.location.origin) return "external";
  if (anchor.pathname === window.location.pathname && anchor.hash) {
    return "anchor";
  }
  return "internal";
}
