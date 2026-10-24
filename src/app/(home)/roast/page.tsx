import type { Metadata } from "next";
import type { WebApplication, WithContext } from "schema-dts";

import { SITE_INFO } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/lib/json-ld";
import { ArrowLeftIcon } from "lucide-react";
import { JSON_LD_ID } from "@/config/json-ld";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { RoastApp } from "@/features/roast/components/roast-app";
import { DocContainer } from "@/features/doc/components/doc-layout";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const PAGE_TITLE = "Roast My Site";
const PAGE_DESCRIPTION =
  "Paste a URL. Get a brutally honest roast backed by real SEO, speed and Lighthouse checks.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/roast" },
  openGraph: {
    siteName: SITE_INFO.name,
    type: "website",
    locale: "en-IN",
    title: `${PAGE_TITLE} – ${SITE_INFO.name}`,
    description: PAGE_DESCRIPTION,
    url: "/roast",
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_INFO.name,
      },
    ],
  },
};

export default function RoastPage() {
  return (
    <>
      <JsonLdScript data={getWebApplicationJsonLd()} />

      <DocContainer>
        {/* Top spacer */}
        <div className="h-12" />

        <div className="screen-line-bottom h-px" />

        {/* Page toolbar */}
        <div className="flex items-center justify-between p-2 pl-4">
          <Button
            className="h-7 gap-2 border-none px-0 text-muted-foreground hover:text-foreground hover:no-underline"
            variant="link"
            size="sm"
            asChild
          >
            <TrackedLink
              href="/"
              event={ANALYTICS_EVENTS.VIEW_HOME}
              eventProperties={{
                section: ANALYTICS_SECTIONS.ROAST_PAGE,
                source: ANALYTICS_SOURCES.TOOLBAR,
              }}
            >
              <ArrowLeftIcon />
              Home
            </TrackedLink>
          </Button>

          <DocShareMenu
            title={PAGE_TITLE}
            url="/roast"
            section={ANALYTICS_SECTIONS.ROAST_PAGE}
          />
        </div>

        <div className="screen-line-top screen-line-bottom py-px">
          <div className="h-4" />
        </div>

        <h1 className="screen-line-bottom px-4 text-4xl font-medium tracking-tight text-balance">
          {PAGE_TITLE}
        </h1>

        <p className="screen-line-bottom p-4 text-balance text-muted-foreground">
          {PAGE_DESCRIPTION}
        </p>

        <div className="h-4" />

        {/* Keeps the footer off the input while the page is just the form. */}
        <div className="screen-line-top screen-line-bottom min-h-[50svh]">
          <RoastApp />
        </div>

        {/* Bottom separator, matches the home page */}
        <div className="stripe-divider h-8 w-full" />
      </DocContainer>
    </>
  );
}

function getWebApplicationJsonLd(): WithContext<WebApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": absoluteUrl("/roast"),
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl("/roast"),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@id": JSON_LD_ID.website },
  };
}
