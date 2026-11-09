"use client";

import type { BookmarkListEntry } from "../types";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { BookmarkList } from "./bookmark-list";
import { useBookmarkFilters } from "../lib/search-params";
import { BTN, BTN_SOFT } from "@/features/home/lib/styles";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_SECTIONS,
  ANALYTICS_SOURCES,
} from "@/lib/analytics-events";

const MIN_ROWS = 5;

export function BookmarkListFiltered({
  entries,
}: {
  entries: BookmarkListEntry[];
}) {
  const [filters, setFilters] = useBookmarkFilters();

  const filteredEntries = entries.filter(
    (entry) => !filters.category || entry.category === filters.category,
  );

  if (filteredEntries.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 px-6 py-8 lg:px-14">
        <p className="font-mono text-[0.8125rem] text-ink/56">
          No bookmarks match this filter.
        </p>

        <button
          type="button"
          className={cn(BTN, BTN_SOFT)}
          onClick={() => {
            trackEvent(ANALYTICS_EVENTS.BOOKMARK_FILTER_CLEARED, {
              section: ANALYTICS_SECTIONS.BOOKMARKS_PAGE,
              source: ANALYTICS_SOURCES.EMPTY_STATE,
              from: filters.category,
            });
            setFilters(null);
          }}
        >
          Clear filter
        </button>
      </div>
    );
  }

  return <BookmarkList entries={filteredEntries} minRows={MIN_ROWS} />;
}
