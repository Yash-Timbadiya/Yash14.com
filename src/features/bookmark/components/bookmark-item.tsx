import type { Bookmark } from "../types";
import type { AnalyticsSection } from "@/lib/analytics-events";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UTM_PARAMS } from "@/config/site";
import { BookmarkCategory } from "../types";
import { addQueryParams } from "@/utils/url";
import { IconTile } from "@/components/ui/icon-tile";
import { Separator } from "@/components/ui/separator";
import { TrackedLink } from "@/components/tracked-link";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  ComponentIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayoutGridIcon,
  NewspaperIcon,
} from "lucide-react";

export function BookmarkItem({
  className,
  bookmark,
  section,
}: {
  className?: string;
  bookmark: Bookmark;
  /** Where the card is rendered, sent with its click event. */
  section: AnalyticsSection;
}) {
  const hasWhy = Boolean(bookmark.why);

  return (
    <div
      className={cn(
        "relative flex pr-2 transition-colors ease-out hover:bg-accent-muted",
        hasWhy ? "items-start" : "items-center",
        className,
      )}
    >
      <IconTile className={cn("mx-4", hasWhy && "mt-3.75")}>
        {bookmark.icon ?? CATEGORY_ICONS[bookmark.category]}
      </IconTile>

      <div className="flex-1 space-y-1 border-l border-dashed border-line p-4 pr-2">
        <h3 className="leading-snug font-medium text-balance">
          <TrackedLink
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
            <span className="absolute inset-0" aria-hidden />
            {bookmark.title}
          </TrackedLink>
        </h3>

        <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {bookmark.author && (
            <>
              <div>
                <dt className="sr-only">Author</dt>
                <dd>{bookmark.author}</dd>
              </div>

              <MetaSeparator />
            </>
          )}

          <div>
            <dt className="sr-only">Category</dt>
            <dd>{bookmark.category}</dd>
          </div>

          <MetaSeparator />

          <div>
            <dt className="sr-only">Bookmarked on</dt>
            <dd>
              <time dateTime={new Date(bookmark.bookmarkedAt).toISOString()}>
                {format(new Date(bookmark.bookmarkedAt), "d MMM yyyy")}
              </time>
            </dd>
          </div>
        </dl>

        {bookmark.why && (
          <p className="mt-4 border-t border-dashed border-line pt-4 text-sm text-pretty text-foreground">
            {bookmark.why}
          </p>
        )}
      </div>

      <ArrowUpRightIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          hasWhy && "mt-4.75",
        )}
        aria-hidden
      />
    </div>
  );
}

function MetaSeparator() {
  return (
    <Separator
      className="data-vertical:h-4 data-vertical:self-center"
      orientation="vertical"
      aria-hidden
    />
  );
}

const CATEGORY_ICONS: Record<BookmarkCategory, React.ReactNode> = {
  [BookmarkCategory.ARTICLE]: <NewspaperIcon strokeWidth={1.5} />,
  [BookmarkCategory.COURSE]: <GraduationCapIcon strokeWidth={1.5} />,
  [BookmarkCategory.BOOK]: <BookOpenIcon strokeWidth={1.5} />,
  [BookmarkCategory.REFERENCE]: <FileTextIcon strokeWidth={1.5} />,
  [BookmarkCategory.UI_LIBRARY]: <ComponentIcon strokeWidth={1.5} />,
  [BookmarkCategory.SOFTWARE]: <LayoutGridIcon strokeWidth={1.5} />,
};
