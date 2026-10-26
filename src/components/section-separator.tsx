import { cn } from "@/lib/utils";

/**
 * The striped band between page sections. Its height comes from
 * `--separator-height` when a page sets one (the home page does), else 2rem.
 */
export function Separator({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "stripe-divider h-[var(--separator-height,2rem)] w-full border-x border-line",
        className,
      )}
    />
  );
}
