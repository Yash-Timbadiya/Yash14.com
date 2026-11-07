import { cn } from "@/lib/utils";

/** Where each dashed guide sits; `--inset` is the gap set on the wrapper. */
const EDGES = {
  top: "top-(--inset) left-0 h-px w-full",
  bottom: "bottom-(--inset) left-0 h-px w-full",
  left: "top-0 left-(--inset) h-full w-px",
  right: "top-0 right-(--inset) h-full w-px",
} as const;

/** Each cross is centred on a corner of the card. */
const CORNERS = {
  "top-left": "top-[calc(var(--inset)-5px)] left-[calc(var(--inset)-5px)]",
  "top-right": "top-[calc(var(--inset)-5px)] right-[calc(var(--inset)-5px)]",
  "bottom-left":
    "bottom-[calc(var(--inset)-5px)] left-[calc(var(--inset)-5px)]",
  "bottom-right":
    "right-[calc(var(--inset)-5px)] bottom-[calc(var(--inset)-5px)]",
} as const;

/**
 * Sits a card inside the frame with room around it, and runs dashed guide
 * lines along its edges out to the rails, with a cross at each corner.
 */
export function InsetFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative p-(--inset) [--inset:1rem] md:[--inset:2rem]",
        className,
      )}
    >
      {Object.entries(EDGES).map(([edge, position]) => {
        const horizontal = edge === "top" || edge === "bottom";
        return (
          <svg
            key={edge}
            className={cn(
              "pointer-events-none absolute overflow-visible stroke-hairline-strong [stroke-dasharray:3_3]",
              position,
            )}
            aria-hidden="true"
          >
            <line
              x1={horizontal ? 0 : 0.5}
              y1={horizontal ? 0.5 : 0}
              x2={horizontal ? "100%" : 0.5}
              y2={horizontal ? 0.5 : "100%"}
            />
          </svg>
        );
      })}

      {Object.entries(CORNERS).map(([corner, position]) => (
        <svg
          key={corner}
          className={cn(
            "pointer-events-none absolute z-2 size-[11px] stroke-ink/40 stroke-1",
            position,
          )}
          viewBox="0 0 11 11"
          aria-hidden="true"
        >
          <path d="M5.5 0v11M0 5.5h11" />
        </svg>
      ))}

      <div className="relative z-1 border border-hairline">{children}</div>
    </div>
  );
}
