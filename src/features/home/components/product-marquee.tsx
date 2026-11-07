"use client";

import type { LinkedItem } from "@/features/home/lib/parse-description";

import { UTM_PARAMS } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { addQueryParams } from "@/utils/url";
import { IconArrowUpRight } from "@tabler/icons-react";
import { LinkPreview } from "@/components/link-preview";
import { ANALYTICS_EVENTS, ANALYTICS_SECTIONS } from "@/lib/analytics-events";

export function ProductMarquee({ products }: { products: LinkedItem[] }) {
  return (
    <div className="home-marquee min-w-0">
      <div className="home-marquee-track">
        {/* The second copy makes the loop seamless; only the first is reachable. */}
        <ul className="flex">
          {products.map((product) => (
            <li key={product.url}>
              <LinkPreview
                className="home-logo-cell"
                url={addQueryParams(product.url, UTM_PARAMS)}
                onClick={() =>
                  trackEvent(ANALYTICS_EVENTS.DESCRIPTION_LINK_CLICK, {
                    section: ANALYTICS_SECTIONS.EXPERIENCE,
                    url: product.url,
                  })
                }
              >
                {product.name}
                <IconArrowUpRight aria-hidden />
              </LinkPreview>
            </li>
          ))}
        </ul>
        <ul className="flex" aria-hidden>
          {products.map((product) => (
            <li key={product.url}>
              <a
                className="home-logo-cell"
                href={addQueryParams(product.url, UTM_PARAMS)}
                target="_blank"
                rel="noopener"
                tabIndex={-1}
              >
                {product.name}
                <IconArrowUpRight aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
