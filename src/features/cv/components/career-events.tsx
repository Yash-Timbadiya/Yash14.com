"use client";

import { useEffect, useRef, useState } from "react";

export type CareerEventMark = {
  label: string;
  date: string;
  /** Horizontal position on the timeline, as a CSS percentage. */
  left: string;
  /** Height of the tick the dot sits on, in px. */
  tickHeight: number;
};

/**
 * Orange dots on the event ticks. Hovering (pointer devices) or tapping
 * (touch) reveals the event's name and date above its dot.
 */
export function CareerEvents({ events }: { events: CareerEventMark[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // A tap anywhere else closes the open label.
  useEffect(() => {
    if (open === null) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={rootRef}>
      {events.map((event) => (
        <button
          key={event.label}
          type="button"
          className="career-dot"
          style={
            {
              left: event.left,
              "--tick-height": `${event.tickHeight}px`,
            } as React.CSSProperties
          }
          aria-expanded={open === event.label}
          aria-label={`${event.label}, ${event.date}`}
          onClick={() =>
            setOpen((current) => (current === event.label ? null : event.label))
          }
        >
          <span className="career-dot-label serif" aria-hidden="true">
            {event.label}
            <small>{event.date}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
