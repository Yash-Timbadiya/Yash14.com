import type { Metadata } from "next";
import type { WebApplication, WithContext } from "schema-dts";

import { cn } from "@/lib/utils";
import { SITE_INFO } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/lib/json-ld";
import { JSON_LD_ID } from "@/config/json-ld";
import { BAND, FRAME } from "@/features/home/lib/styles";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { RoastApp } from "@/features/roast/components/roast-app";
import { PageHeader } from "@/features/home/components/page-header";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import { AnimatedFlameIcon } from "@/features/roast/components/animated-flame-icon";

const PAGE_TITLE = "Roast My Site";
const PAGE_DESCRIPTION =
  "Paste a URL. Get a brutally honest AI roast of its design, copy, UX, SEO and speed, backed by real Lighthouse checks and fixes.";

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

      <PageHeader
        section={ANALYTICS_SECTIONS.ROAST_PAGE}
        seed={37}
        icon={<AnimatedFlameIcon className="size-4.5 text-heat" />}
        label={PAGE_TITLE}
        title={
          <>
            Get your site <span className="text-heat">roasted</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        actions={
          <DocShareMenu
            title={PAGE_TITLE}
            url="/roast"
            section={ANALYTICS_SECTIONS.ROAST_PAGE}
          />
        }
      />

      {/* Keeps the footer off the input while the page is just the form. */}
      <div className={BAND}>
        <div className={cn(FRAME, "min-h-[50svh]")}>
          <RoastApp />
        </div>
      </div>
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
    featureList: [
      "Google Lighthouse speed, SEO, accessibility and best-practice scores",
      "AI-written roast of design, copy, user experience and business",
      "Plain-language fixes for every failing check",
      "Classic, Split and Editorial report layouts",
      "Export as Markdown, HTML or JSON",
    ],
    creator: { "@id": JSON_LD_ID.person },
    isPartOf: { "@id": JSON_LD_ID.website },
  };
}
