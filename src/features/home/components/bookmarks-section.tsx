import { format } from "date-fns";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { BOOKMARKS } from "@/features/bookmark/data";
import { TrackedLink } from "@/components/tracked-link";
import { SectionHead, SectionIndex } from "./section-intro";
import { BookmarkCategory } from "@/features/bookmark/types";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import {
  IconArrowUpRight,
  IconArticleFilled,
  IconBookFilled,
  IconBookmarkFilled,
  IconChevronRight,
  IconDotsFilled,
  IconFileTextFilled,
  IconLayoutGridFilled,
  IconSchoolFilled,
  IconStackFilled,
} from "@tabler/icons-react";

const PREVIEW_COUNT = 5;

const CATEGORY_ICONS: Record<BookmarkCategory, React.ReactNode> = {
  [BookmarkCategory.ARTICLE]: <IconArticleFilled />,
  [BookmarkCategory.COURSE]: <IconSchoolFilled />,
  [BookmarkCategory.BOOK]: <IconBookFilled />,
  [BookmarkCategory.REFERENCE]: <IconFileTextFilled />,
  [BookmarkCategory.UI_LIBRARY]: <IconStackFilled />,
  [BookmarkCategory.SOFTWARE]: <IconLayoutGridFilled />,
  [BookmarkCategory.OTHER]: <IconDotsFilled />,
};

export function BookmarksSection() {
  const latest = sortBookmarksNewestFirst(BOOKMARKS).slice(0, PREVIEW_COUNT);

  return (
    <section id="bookmarks" className="scroll-mt-16">
      <SectionIndex index={5} label="Bookmarks" />
      <SectionHead
        seed={71}
        icon={<IconBookmarkFilled aria-hidden />}
        label="Bookmarks"
        title={
          <>
            Things worth <span className="home-heat">saving</span>
          </>
        }
        description={`${BOOKMARKS.length} saved so far. These are the latest ${PREVIEW_COUNT}.`}
      />

      <div className="home-band">
        <div className="home-frame grid lg:grid-cols-2">
          <span className="home-star max-lg:hidden" aria-hidden />
          <div className="flex flex-col gap-4 border-line px-6 py-8 max-lg:border-b lg:border-r lg:px-14 lg:py-10">
            <h3 className="text-[1.5rem]/tight font-medium tracking-[-0.016em]">
              Latest
            </h3>
            <TrackedLink
              className="home-link w-fit"
              href="/bookmarks"
              event={ANALYTICS_EVENTS.VIEW_BOOKMARKS}
              eventProperties={{
                section: ANALYTICS_SECTIONS.BOOKMARKS,
                source: ANALYTICS_SOURCES.VIEW_ALL,
              }}
            >
              All bookmarks
              <IconChevronRight aria-hidden />
            </TrackedLink>
          </div>

          <ul className="min-w-0">
            {latest.map((bookmark) => (
              <li key={bookmark.url}>
                <TrackedLink
                  className="home-row-link grid-cols-[1rem_minmax(0,1fr)_0.875rem] items-start gap-x-3.5 px-6 py-5 lg:pr-10 lg:pl-14"
                  href={addQueryParams(bookmark.url, UTM_PARAMS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  event={ANALYTICS_EVENTS.BOOKMARK_CLICK}
                  eventProperties={{
                    section: ANALYTICS_SECTIONS.BOOKMARKS,
                    title: bookmark.title,
                    url: bookmark.url,
                    category: bookmark.category,
                  }}
                >
                  <span className="mt-0.5 text-(color:--ink-40) [&_svg]:size-4">
                    {bookmark.icon ?? CATEGORY_ICONS[bookmark.category]}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] font-medium text-balance">
                      {bookmark.title}
                    </span>
                    {bookmark.why && (
                      <span className="mt-1 block text-[0.8125rem]/normal text-pretty text-(color:--ink-72)">
                        {bookmark.why}
                      </span>
                    )}
                    <span className="home-mono-label mt-1.5 flex flex-wrap gap-x-2 *:not-first:before:mr-2 *:not-first:before:content-['·']">
                      {bookmark.author && <span>{bookmark.author}</span>}
                      <span>{bookmark.category}</span>
                      <time
                        dateTime={new Date(bookmark.bookmarkedAt).toISOString()}
                      >
                        {format(new Date(bookmark.bookmarkedAt), "d MMM yyyy")}
                      </time>
                    </span>
                  </span>

                  <IconArrowUpRight
                    className="home-row-arrow mt-1"
                    aria-hidden
                  />
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
