import { cn } from "@/lib/utils";
import { HoverArrow } from "./hover-arrow";
import { BOOKMARKS } from "@/features/bookmark/data";
import { TrackedLink } from "@/components/tracked-link";
import { IconBookmarkFilled } from "@tabler/icons-react";
import { SectionHead, SectionIndex } from "./section-intro";
import { BAND, FRAME, LINK, STAR } from "@/features/home/lib/styles";
import { sortBookmarksNewestFirst } from "@/features/bookmark/lib/sort";
import { BookmarkItem } from "@/features/bookmark/components/bookmark-item";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const PREVIEW_COUNT = 5;

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
            Things worth <span className="text-heat">saving</span>
          </>
        }
        description={`${BOOKMARKS.length} saved so far. These are the latest ${PREVIEW_COUNT}.`}
      />

      <div className={BAND}>
        <div className={cn(FRAME, "grid lg:grid-cols-2")}>
          <span className={cn(STAR, "max-lg:hidden")} aria-hidden />
          <div className="flex flex-col gap-4 border-line px-6 py-8 max-lg:border-b lg:border-r lg:px-14 lg:py-10">
            <h3 className="text-[1.5rem]/tight font-medium tracking-[-0.016em]">
              Latest
            </h3>
            <TrackedLink
              className={cn(LINK, "w-fit text-[0.875rem]")}
              href="/bookmarks"
              event={ANALYTICS_EVENTS.VIEW_BOOKMARKS}
              eventProperties={{
                section: ANALYTICS_SECTIONS.BOOKMARKS,
                source: ANALYTICS_SOURCES.VIEW_ALL,
              }}
            >
              All bookmarks
              <HoverArrow />
            </TrackedLink>
          </div>

          <ul className="min-w-0">
            {latest.map((bookmark) => (
              <li key={bookmark.url}>
                <BookmarkItem
                  bookmark={bookmark}
                  section={ANALYTICS_SECTIONS.BOOKMARKS}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
