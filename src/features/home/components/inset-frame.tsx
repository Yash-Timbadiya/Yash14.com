import { cn } from "@/lib/utils";

const EDGES = ["top", "bottom", "left", "right"] as const;
const CORNERS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

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
    <div className={cn("home-inset", className)}>
      {EDGES.map((edge) => {
        const horizontal = edge === "top" || edge === "bottom";
        return (
          <svg
            key={edge}
            className="home-inset-line"
            data-edge={edge}
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

      {CORNERS.map((corner) => (
        <svg
          key={corner}
          className="home-inset-cross"
          data-corner={corner}
          viewBox="0 0 11 11"
          aria-hidden="true"
        >
          <path d="M5.5 0v11M0 5.5h11" />
        </svg>
      ))}

      <div className="home-inset-card">{children}</div>
    </div>
  );
}
