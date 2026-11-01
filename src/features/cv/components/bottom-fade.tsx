"use client";

import { useEffect, useState } from "react";

/**
 * Same soft blur the home page has, tinted to the sheet and the desk. Once
 * the sheet's bottom edge is on screen the sheet tint drops out, or it would
 * paint a ghost strip of sheet over the desk below.
 */
export function BottomFade() {
  const [sheetEnded, setSheetEnded] = useState(false);

  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>(".cv .sheet");
    if (!sheet) return;

    const update = () => {
      setSheetEnded(sheet.getBoundingClientRect().bottom <= window.innerHeight);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="bottom-fade" aria-hidden="true">
      <div className="bottom-fade-sheet" data-hidden={sheetEnded} />
    </div>
  );
}
