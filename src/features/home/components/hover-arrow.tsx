import { cn } from "@/lib/utils";

/** A heavy chevron pointing right, shared by the arrows below. */
const CHEVRON =
  "M4.84766 3.63379L5.45898 4.25L4.84766 4.86621L1.24219 8.49902L0 7.2666L2.99316 4.24902L0 1.23242L1.24219 0L4.84766 3.63379Z";

/**
 * A chevron that grows a shaft when its parent is hovered: ">" becomes "->".
 * Sizes are important so a parent's `[&_svg]:size-*` can't stretch it.
 */
export function HoverArrow() {
  return (
    <svg
      className="h-[0.6rem]! w-1.5! shrink-0 overflow-visible"
      width="5"
      height="8"
      fill="none"
      viewBox="0 0.5 5 8"
      aria-hidden="true"
    >
      <g className="transition-[translate] duration-200 ease-snappy [:hover>svg>&]:translate-x-[3px]">
        <rect
          className="origin-right scale-x-0 transition-[scale] duration-200 ease-snappy [transform-box:fill-box] [:hover>svg>g>&]:scale-x-100"
          x="-3.5"
          y="3.375"
          width="7"
          height="1.75"
          fill="currentColor"
        />
        <path d={CHEVRON} fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * The same heavy chevron turned to point down, for disclosure toggles. Turns
 * up while its parent's panel or menu is open.
 */
export function DisclosureChevron({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "h-1.5! w-[0.6rem]! shrink-0 transition-[rotate] duration-200 ease-snappy [[aria-expanded=true]>&]:rotate-180 [[data-panel-open]>&]:rotate-180",
        className,
      )}
      width="8"
      height="5"
      fill="none"
      viewBox="0 0 8.5 5.46"
      aria-hidden="true"
    >
      <path
        d={CHEVRON}
        fill="currentColor"
        transform="matrix(0 1 -1 0 8.5 0)"
      />
    </svg>
  );
}

/** The heavy chevron on its own, pointing right, for rows that go somewhere. */
export function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-1.5 -0.5 8.5 9.5"
      fill="none"
      aria-hidden="true"
    >
      <path d={CHEVRON} fill="currentColor" />
    </svg>
  );
}

/**
 * A heavy arrow pointing up and right, for links that leave the site. One
 * stroked path, so a translucent color never doubles where lines meet.
 */
export function ExternalArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.25 7.75 7.5 2.5M3.25 2.5H7.5v4.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
