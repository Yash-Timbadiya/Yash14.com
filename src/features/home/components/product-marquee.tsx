"use client";

import type { LinkedItem } from "@/features/home/lib/parse-description";

import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { ExternalArrow } from "./hover-arrow";
import { LinkPreview } from "@/components/link-preview";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

/** A product name cell: an underline grows along the bottom and an arrow fades in on hover. */
const LOGO_CELL =
  "relative flex h-full min-h-30 w-54 items-center justify-center border-l border-hairline text-[1.375rem] font-semibold tracking-[-0.03em] whitespace-nowrap text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-ink/40 after:transition-transform after:duration-300 after:ease-snappy hover:after:scale-x-100 [&>svg]:absolute [&>svg]:right-2 [&>svg]:bottom-2 [&>svg]:size-3.5 [&>svg]:text-heat [&>svg]:opacity-0 [&>svg]:transition-opacity [&>svg]:duration-150 [&>svg]:ease-out hover:[&>svg]:opacity-100";

export function ProductMarquee({ products }: { products: LinkedItem[] }) {
  return (
    <div className="group/marquee min-w-0 overflow-hidden motion-reduce:overflow-x-auto">
      <div className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
        {/* The second copy makes the loop seamless; only the first is reachable. */}
        <ul className="flex">
          {products.map((product) => (
            <li key={product.url}>
              <LinkPreview
                className={LOGO_CELL}
                url={addQueryParams(product.url, UTM_PARAMS)}
                onClick={() =>
                  trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
                    section: ANALYTICS_SECTIONS.EXPERIENCE,
                    url: product.url,
                  })
                }
              >
                {product.name}
                <ExternalArrow />
              </LinkPreview>
            </li>
          ))}
        </ul>
        <ul className="flex" aria-hidden>
          {products.map((product) => (
            <li key={product.url}>
              <a
                className={LOGO_CELL}
                href={addQueryParams(product.url, UTM_PARAMS)}
                target="_blank"
                rel="noopener"
                tabIndex={-1}
              >
                {product.name}
                <ExternalArrow />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
