import type { Bookmark } from "@/features/bookmark/types";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UTM_PARAMS } from "@/config/site";
import { addQueryParams } from "@/utils/url";
import { BOOKMARKS } from "@/features/bookmark/data";
import { TrackedLink } from "@/components/tracked-link";
import { IconBookmarkFilled } from "@tabler/icons-react";
import { ExternalArrow, HoverArrow } from "./hover-arrow";
import { SectionHead, SectionIndex } from "./section-intro";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import { CATEGORY_ICONS } from "@/features/bookmark/components/bookmark-item";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";
import {
  BAND,
  FRAME,
  LINK,
  MONO_LABEL,
  ROW_ARROW,
  ROW_LINK,
  STAR,
} from "@/features/home/lib/styles";

const PREVIEW_COUNT = 5;

const iconOf = (bookmark: Bookmark) =>
  bookmark.icon ?? CATEGORY_ICONS[bookmark.category];

/**
 * The newest bookmark fills the left half as a feature; the next ones list on
 * the right, closed by a link to the rest. Stacks into one column on phones.
 */
export function BookmarksSection() {
  const [newest, ...rest] = sortBookmarksNewestFirst(BOOKMARKS).slice(
    0,
    PREVIEW_COUNT,
  );

  return (
    <section id="bookmarks" className="scroll-mt-16">
      <SectionIndex index={5} label="Bookmarks" />
      <SectionHead
        seed={71}
        icon={<IconBookmarkFilled aria-hidden />}
        label="Bookmarks"
        title={
          <>
            Things worth <span className="text-heat">saving</span>
          </>
        }
        description={`${BOOKMARKS.length} saved so far. These are the latest ${PREVIEW_COUNT}.`}
      />

      {newest && (
        <div className={BAND}>
          <div className={cn(FRAME, "grid lg:grid-cols-2")}>
            <span className={cn(STAR, "max-lg:hidden")} aria-hidden />

            <BookmarkLink
              bookmark={newest}
              className="group/row flex flex-col justify-between gap-8 border-hairline px-5 py-7 transition-colors duration-150 hover:bg-ink/4 max-lg:border-b sm:px-6 sm:py-8 lg:min-h-64 lg:gap-10 lg:border-r lg:px-14 lg:py-12"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-heat/12 px-2.5 py-1 font-mono text-xs/4 text-heat">
                  <span className="size-1.5 rounded-full bg-heat" />
                  Newest
                </span>
                <ExternalArrow className={ROW_ARROW} aria-hidden />
              </span>

              <span className="flex flex-col gap-3 lg:gap-4">
                <span className="flex size-9 items-center justify-center rounded-[0.625rem] border border-hairline text-ink/56 lg:size-10 [&_svg]:size-4.5 lg:[&_svg]:size-5">
                  {iconOf(newest)}
                </span>
                <span className="text-[clamp(1.625rem,3vw,2.5rem)]/[1.1] font-medium tracking-[-0.02em] text-balance">
                  {newest.title}
                </span>
                {newest.why && (
                  <span className="max-w-md text-[0.9375rem]/[1.6] text-pretty text-ink/72">
                    {newest.why}
                  </span>
                )}
                <Meta bookmark={newest} />
              </span>
            </BookmarkLink>

            <ul className="flex min-w-0 flex-col">
              {rest.map((bookmark) => (
                <li key={bookmark.url}>
                  <BookmarkLink
                    bookmark={bookmark}
                    className={cn(
                      ROW_LINK,
                      "grid-cols-[1rem_minmax(0,1fr)_0.875rem] items-start gap-x-3 px-5 py-4 sm:gap-x-3.5 sm:px-6 sm:py-5 lg:pr-10 lg:pl-12",
                    )}
                  >
                    <span className="mt-0.5 text-ink/40 [&_svg]:size-4">
                      {iconOf(bookmark)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] font-medium text-balance">
                        {bookmark.title}
                      </span>
                      <Meta bookmark={bookmark} className="mt-1" />
                    </span>
                    <ExternalArrow
                      className={cn(ROW_ARROW, "mt-1")}
                      aria-hidden
                    />
                  </BookmarkLink>
                </li>
              ))}
              <li className="mt-auto flex px-5 py-5 sm:px-6 lg:pl-12">
                <TrackedLink
                  className={cn(LINK, "w-fit")}
                  href="/bookmarks"
                  event={ANALYTICS_EVENTS.VIEW_BOOKMARKS}
                  eventProperties={{
                    section: ANALYTICS_SECTIONS.BOOKMARKS,
                    source: ANALYTICS_SOURCES.VIEW_ALL,
                  }}
                >
                  See all {BOOKMARKS.length}
                  <HoverArrow />
                </TrackedLink>
              </li>
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function BookmarkLink({
  bookmark,
  className,
  children,
}: {
  bookmark: Bookmark;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TrackedLink
      className={className}
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
      {children}
    </TrackedLink>
  );
}

/** "Author · Category · Date", dot-separated. */
function Meta({
  bookmark,
  className,
}: {
  bookmark: Bookmark;
  className?: string;
}) {
  return (
    <span
      className={cn(
        MONO_LABEL,
        "flex flex-wrap gap-x-2 gap-y-0.5 *:not-first:before:mr-2 *:not-first:before:content-['·']",
        className,
      )}
    >
      {bookmark.author && <span>{bookmark.author}</span>}
      <span>{bookmark.category}</span>
      <time dateTime={new Date(bookmark.bookmarkedAt).toISOString()}>
        {format(new Date(bookmark.bookmarkedAt), "d MMM yyyy")}
      </time>
    </span>
  );
}
