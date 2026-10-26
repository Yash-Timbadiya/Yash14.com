import type { RoastResult } from "@/features/roast/types";

import { cn } from "@/lib/utils";
import { ACCENT_TEXT } from "@/features/roast/components/report-variants/shared";

/** The verdict as a pull quote over a huge faded mark, signed by hand. */
export function FinalVerdict({ result }: { result: RoastResult }) {
  return (
    <figure className="relative overflow-hidden px-4 py-8 sm:px-8">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-6 -left-2 font-serif text-[14rem] leading-none text-muted-foreground/40 opacity-15 select-none sm:-top-10 sm:text-[18rem]",
          ACCENT_TEXT,
        )}
      >
        &ldquo;
      </span>
      <blockquote className="relative font-serif text-2xl text-balance italic sm:text-3xl">
        {result.verdict}
      </blockquote>
      <figcaption className="relative mt-4 flex items-baseline justify-between gap-4">
        <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Final verdict on {result.domain}
        </span>
        <span
          className={cn(
            "font-handwritten text-2xl text-foreground",
            ACCENT_TEXT,
          )}
        >
          &ndash; the roaster
        </span>
      </figcaption>
    </figure>
  );
}
