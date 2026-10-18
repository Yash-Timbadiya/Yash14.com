import type { Metadata } from "next";
import type { CollectionPage, WithContext } from "schema-dts";
import type { BookmarkListEntry } from "@/features/bookmark/types";

import { Suspense } from "react";
import { SITE_INFO } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/lib/json-ld";
import { ArrowLeftIcon } from "lucide-react";
import { JSON_LD_ID } from "@/config/json-ld";
import { Button } from "@/components/ui/button";
import { BOOKMARKS } from "@/features/bookmark/data";
import { TrackedLink } from "@/components/tracked-link";
import { DocContainer } from "@/features/doc/components/doc-layout";
import { BOOKMARK_CATEGORY_TO_PARAM } from "@/features/bookmark/types";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import { BookmarkItem } from "@/features/bookmark/components/bookmark-item";
import { BookmarkList } from "@/features/bookmark/components/bookmark-list";
import { BookmarkFilters } from "@/features/bookmark/components/bookmark-filters";
import { LLMCopyButtonWithViewOptions } from "@/features/doc/components/doc-page-actions";
import { BookmarkListFiltered } from "@/features/bookmark/components/bookmark-list-filtered";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const PAGE_TITLE = "Bookmarks";
const PAGE_DESCRIPTION =
  "Hand-picked articles, courses, books, and references worth your time.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/bookmarks",
  },
  openGraph: {
    siteName: SITE_INFO.name,
    type: "website",
    locale: "en-IN",
    title: `${PAGE_TITLE} – ${SITE_INFO.name}`,
    description: PAGE_DESCRIPTION,
    url: "/bookmarks",
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

const SORTED_BOOKMARKS = sortBookmarksNewestFirst(BOOKMARKS);

export default function BookmarksPage() {
  const entries = SORTED_BOOKMARKS.map<BookmarkListEntry>((bookmark) => ({
    url: bookmark.url,
    category: BOOKMARK_CATEGORY_TO_PARAM[bookmark.category],
    card: (
      <BookmarkItem
        bookmark={bookmark}
        section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
      />
    ),
  }));

  const categories = [...new Set(entries.map((entry) => entry.category))];

  return (
    <>
      <JsonLdScript data={getCollectionPageJsonLd()} />

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
                section: ANALYTICS_SECTIONS.BOOKMARKS_PAGE,
                source: ANALYTICS_SOURCES.TOOLBAR,
              }}
            >
              <ArrowLeftIcon />
              Home
            </TrackedLink>
          </Button>

          <div className="flex items-center gap-2">
            <LLMCopyButtonWithViewOptions
              markdownUrl="/bookmarks.md"
              section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
            />
            <DocShareMenu
              title={PAGE_TITLE}
              url="/bookmarks"
              section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
            />
          </div>
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

        <div className="screen-line-top screen-line-bottom">
          <Suspense fallback={<div className="h-12" />}>
            <BookmarkFilters categories={categories} />
          </Suspense>
        </div>

        <div className="stripe-divider h-4 w-full" />

        <div className="screen-line-top screen-line-bottom">
          <Suspense fallback={<BookmarkList entries={entries} />}>
            <BookmarkListFiltered entries={entries} />
          </Suspense>
        </div>

        {/* Bottom separator, matches the home page */}
        <div className="stripe-divider h-8 w-full" />
      </DocContainer>
    </>
  );
}

function getCollectionPageJsonLd(): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/bookmarks"),
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl("/bookmarks"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SORTED_BOOKMARKS.length,
      itemListElement: SORTED_BOOKMARKS.map((bookmark, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: bookmark.url,
        name: bookmark.title,
      })),
    },
    isPartOf: { "@id": JSON_LD_ID.website },
  };
}
