import type { Metadata } from "next";
import type { CollectionPage, WithContext } from "schema-dts";
import type { BookmarkListEntry } from "@/features/bookmark/types";

import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { SITE_INFO } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import { JsonLdScript } from "@/lib/json-ld";
import { JSON_LD_ID } from "@/config/json-ld";
import { BOOKMARKS } from "@/features/bookmark/data";
import { BAND, FRAME } from "@/features/home/lib/styles";
import { IconBookmarkFilled } from "@tabler/icons-react";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { PageHeader } from "@/features/home/components/page-header";
import { BOOKMARK_CATEGORY_TO_PARAM } from "@/features/bookmark/types";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import { DocShareMenu } from "@/features/doc/components/doc-share-menu";
import { BookmarkItem } from "@/features/bookmark/components/bookmark-item";
import { BookmarkList } from "@/features/bookmark/components/bookmark-list";
import { BookmarkFilters } from "@/features/bookmark/components/bookmark-filters";
import { LLMCopyButtonWithViewOptions } from "@/features/doc/components/doc-page-actions";
import { BookmarkListFiltered } from "@/features/bookmark/components/bookmark-list-filtered";

const PAGE_TITLE = "Bookmarks";
const PAGE_DESCRIPTION =
  "Hand-picked articles, courses, books, and references worth your time.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/bookmarks",
    types: {
      "application/rss+xml": [{ url: "/rss", title: "Bookmarks RSS" }],
    },
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

      <PageHeader
        section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
        seed={71}
        icon={<IconBookmarkFilled aria-hidden />}
        label={PAGE_TITLE}
        title={
          <>
            Things worth <span className="text-heat">saving</span>
          </>
        }
        description={PAGE_DESCRIPTION}
        actions={
          <>
            <LLMCopyButtonWithViewOptions
              markdownUrl="/bookmarks.md"
              section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
            />
            <DocShareMenu
              title={PAGE_TITLE}
              url="/bookmarks"
              section={ANALYTICS_SECTIONS.BOOKMARKS_PAGE}
            />
          </>
        }
      />

      <div className={BAND}>
        <div className={FRAME}>
          <Suspense fallback={<div className="h-12" />}>
            <BookmarkFilters categories={categories} />
          </Suspense>
        </div>
      </div>

      <div className={BAND}>
        <div className={cn(FRAME, "-mb-px")}>
          <Suspense fallback={<BookmarkList entries={entries} />}>
            <BookmarkListFiltered entries={entries} />
          </Suspense>
        </div>
      </div>
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
