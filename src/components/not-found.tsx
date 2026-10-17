import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function NotFound({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[calc(100svh-5.5rem)] flex-col items-center justify-center",
        className,
      )}
    >
      <svg
        className="h-32 w-full text-border"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 700 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        {/* Y */}
        <rect
          x="202"
          y="2"
          width="96"
          height="196"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="102"
          y="202"
          width="96"
          height="196"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="2"
          y="2"
          width="96"
          height="196"
          vectorEffect="non-scaling-stroke"
        />
        {/* T */}
        <rect
          x="402"
          y="98"
          width="96"
          height="296"
          transform="rotate(-90 402 98)"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="502"
          y="2"
          width="96"
          height="396"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <h1 className="my-6 text-8xl font-medium tracking-tighter tabular-nums">
        404
      </h1>

      <Button asChild>
        <TrackedLink
          href="/"
          event={ANALYTICS_EVENTS.VIEW_HOME}
          eventProperties={{ section: ANALYTICS_SECTIONS.NOT_FOUND }}
        >
          Go to Home
          <ArrowRightIcon />
        </TrackedLink>
      </Button>
    </div>
  );
}
