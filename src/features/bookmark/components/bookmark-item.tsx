import type { Bookmark } from "../types";
import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UTM_PARAMS } from "@/config/site";
import { BookmarkCategory } from "../types";
import { addQueryParams } from "@/utils/url";
import { TrackedLink } from "@/components/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { ExternalArrow } from "@/features/home/components/hover-arrow";
import { MONO_LABEL, ROW_ARROW, ROW_LINK } from "@/features/home/lib/styles";
import {
  IconArticleFilled,
  IconBookFilled,
  IconDotsFilled,
  IconFileTextFilled,
  IconLayoutGridFilled,
  IconSchoolFilled,
  IconStackFilled,
} from "@tabler/icons-react";

export const CATEGORY_ICONS: Record<BookmarkCategory, React.ReactNode> = {
  [BookmarkCategory.ARTICLE]: <IconArticleFilled />,
  [BookmarkCategory.COURSE]: <IconSchoolFilled />,
  [BookmarkCategory.BOOK]: <IconBookFilled />,
  [BookmarkCategory.REFERENCE]: <IconFileTextFilled />,
  [BookmarkCategory.UI_LIBRARY]: <IconStackFilled />,
  [BookmarkCategory.SOFTWARE]: <IconLayoutGridFilled />,
  [BookmarkCategory.OTHER]: <IconDotsFilled />,
};

/** One bookmark as a ruled row: icon, title, why, then author · category · date. */
export function BookmarkItem({
  className,
  bookmark,
  section,
}: {
  className?: string;
  bookmark: Bookmark;
  /** Where the row is rendered, sent with its click event. */
  section: AnalyticsSection;
}) {
  return (
    <TrackedLink
      className={cn(
        ROW_LINK,
        "grid-cols-[1rem_minmax(0,1fr)_0.875rem] items-start gap-x-3.5 px-6 py-5 lg:pr-10 lg:pl-14",
        className,
      )}
      href={addQueryParams(bookmark.url, UTM_PARAMS)}
      target="_blank"
      rel="noopener noreferrer"
      event={ANALYTICS_EVENTS.BOOKMARK_CLICK}
      eventProperties={{
        section,
        title: bookmark.title,
        url: bookmark.url,
        category: bookmark.category,
      }}
    >
      <span className="mt-0.5 text-ink/40 [&_svg]:size-4">
        {bookmark.icon ?? CATEGORY_ICONS[bookmark.category]}
      </span>

      <span className="min-w-0">
        <span className="block text-[0.9375rem] font-medium text-balance">
          {bookmark.title}
        </span>
        {bookmark.why && (
          <span className="mt-1 block text-[0.8125rem]/normal text-pretty text-ink/72">
            {bookmark.why}
          </span>
        )}
        <span
          className={cn(
            MONO_LABEL,
            "mt-1.5 flex flex-wrap gap-x-2 *:not-first:before:mr-2 *:not-first:before:content-['·']",
          )}
        >
          {bookmark.author && <span>{bookmark.author}</span>}
          <span>{bookmark.category}</span>
          <time dateTime={new Date(bookmark.bookmarkedAt).toISOString()}>
            {format(new Date(bookmark.bookmarkedAt), "d MMM yyyy")}
          </time>
        </span>
      </span>

      <ExternalArrow className={cn(ROW_ARROW, "mt-1")} />
    </TrackedLink>
  );
}
