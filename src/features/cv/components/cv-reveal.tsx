"use client";

import { useEffect } from "react";

/** Each section's children rise in this far apart, capped so long ones don't drag. */
const MAX_STAGGER_STEPS = 5;

/**
 * Fades each section's heading and content up as it scrolls into view.
 * Anything already on screen when this runs is marked revealed straight
 * away, so nothing visible blinks out and back. cv.css only hides content
 * once `data-reveal-ready` is set, so without JavaScript everything shows.
 */
export function CvReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".cv");
    if (!root) return;

    const targets: HTMLElement[] = [];
    for (const section of root.querySelectorAll<HTMLElement>(".section")) {
      Array.from(section.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        child.dataset.reveal = "";
        child.style.setProperty(
          "--reveal-i",
          String(Math.min(index, MAX_STAGGER_STEPS)),
        );
        targets.push(child);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "animate";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const target of targets) {
      const { top, bottom } = target.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) {
        target.dataset.revealed = "instant";
      } else {
        observer.observe(target);
      }
    }
    root.dataset.revealReady = "true";

    return () => observer.disconnect();
  }, []);

  return null;
}
