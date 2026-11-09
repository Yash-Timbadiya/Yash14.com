"use client";

import type { LinkedItem } from "@/features/home/lib/parse-description";

import Image from "next/image";
import { cdn } from "@/utils/cdn";
import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { ExternalArrow } from "./hover-arrow";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

/** A product name cell: an underline grows along the bottom and an arrow fades in on hover. */
const LOGO_CELL =
  "relative flex h-full min-h-18 items-center justify-center gap-2 border-l border-hairline px-6 text-[1.0625rem] lg:min-h-30 lg:w-54 lg:gap-2.5 lg:px-0 lg:text-[1.375rem] font-semibold tracking-[-0.03em] whitespace-nowrap text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-ink/40 after:transition-transform after:duration-300 after:ease-snappy hover:after:scale-x-100 [&>svg]:absolute [&>svg]:right-2 [&>svg]:bottom-2 [&>svg]:size-3.5 [&>svg]:text-heat [&>svg]:opacity-0 [&>svg]:transition-opacity [&>svg]:duration-150 [&>svg]:ease-out hover:[&>svg]:opacity-100";

/** Replaced favicons get a new file name, since the CDN caches files as immutable. */
const FAVICON_VERSION: Record<string, number> = { "meisolar.in": 3 };

/** The product's favicon from the CDN (cdn/favicons/), named by hostname. */
function ProductLogo({ url }: { url: string }) {
  const host = new URL(url).hostname;
  const version = FAVICON_VERSION[host];
  return (
    <Image
      className="size-5 shrink-0 rounded-md grayscale transition-[filter] duration-150 lg:size-7 dark:brightness-[1.6] dark:contrast-[0.9] [:hover>&]:filter-none"
      src={cdn(`/favicons/${host}${version ? `.v${version}` : ""}.png`)}
      alt=""
      width={28}
      height={28}
    />
  );
}

export function ProductMarquee({ products }: { products: LinkedItem[] }) {
  return (
    <div className="group/marquee relative min-w-0 overflow-hidden mask-[linear-gradient(to_right,transparent,black_6rem,black_calc(100%-6rem),transparent)] motion-reduce:overflow-x-auto">
      {/* Logos blur and fade at both ends: coming in on the right, leaving under the label. */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-1 w-24 backdrop-blur-[3px] mask-[linear-gradient(to_right,black,transparent)]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 z-1 w-24 backdrop-blur-[3px] mask-[linear-gradient(to_left,black,transparent)]"
        aria-hidden
      />
      <div className="flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
        {/* The second copy makes the loop seamless; only the first is reachable. */}
        <ul className="flex">
          {products.map((product) => (
            <li key={product.url}>
              <a
                className={LOGO_CELL}
                href={addQueryParams(product.url, UTM_PARAMS)}
                target="_blank"
                rel="noopener"
                onClick={() =>
                  trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
                    section: ANALYTICS_SECTIONS.EXPERIENCE,
                    url: product.url,
                  })
                }
              >
                <ProductLogo url={product.url} />
                {product.name}
                <ExternalArrow />
              </a>
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
                <ProductLogo url={product.url} />
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
